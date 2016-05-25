
const builder = require('source-media-query-builder')
const contains = require('viewport-funcs').contains
const Watcher = require('scroll-resize')

module.exports = QueryLoader

const started = 'started'
const stopped = 'stopped'
const killed  = 'killed'

function QueryLoader(cb) {
  if (!(this instanceof QueryLoader)) return new QueryLoader(cb)

  this.cb = cb
  this.arr = []
  this.prev = 0
  this.watching = false
  this.status = stopped
  this.check = bind(this, this.check)
  this.update = bind(this, this.update)
}

QueryLoader.prototype.add = function(data) {
  if (this.status == killed) return

  var arr = toArray(data)
  if (arr.length == 0) return

  var attributes = arr.reduce(reducer, {})

  var mq = builder(attributes.media)
  if (mq == '') return

  var mql = window.matchMedia(mq)
  mql.addListener(this.check)

  this.arr.push({
    attributes: attributes,
        loader: new Loader(this, this.arr.length),
           mql: mql,
  })

  return mq
}

QueryLoader.prototype.find = function(node) {
  if (node && node.nodeType == 1) {
    var list = node.querySelectorAll('source')
    for (var i = 0, n = list.length; i < n; i++) {
      this.add(list.item(i))
    }
  }
}

QueryLoader.prototype.start = function(node, offset) {
  if (this.status == stopped) {
    this.status = started
    if (inBody(node)) this.watch(node, offset)
    else this.check()
  }
}

QueryLoader.prototype.watch = function(node, offset) {
  this.watching = true
  this.node = node
  this.offset = offset == undefined ? 200 : offset
  this.watcher = new Watcher(this.update, {silent:true})
  this.watcher.start()
}

QueryLoader.prototype.update = function() {
  if (this.status != started) return
  if (contains(this.node, this.offset)) {
    this.unwatch()
    this.check()
  }
}

QueryLoader.prototype.unwatch = function() {
  this.watching = false
  if (this.watcher) {
    this.watcher.stop()
    this.watcher = null
  }
}

QueryLoader.prototype.check = function() {
  if (this.status != started || this.watching === true) return
  var now = Date.now()
  if (now - this.prev < 20) return
  this.prev = now

  for (var i = 0, n = this.arr.length; i < n; i++) {
    if (this.arr[i].mql.matches) {
      this.arr[i].loader.load()
      return i
    }
  }

  return -1
}

QueryLoader.prototype.stop = function() {
  if (this.status == started) {
    this.status = stopped
    this.unwatch()
  }
}

QueryLoader.prototype.kill = function() {
  this.status = killed
  for (var i = 0, n = this.arr.length; i < n; i++) {
    this.arr[i].mql.removeListener(this.check)
  }
  this.arr.length = 0
  this.unwatch()
}

// fast bind -- from https://github.com/component/bind
function bind(ctx, fn) {
  return function() {
    return fn.apply(ctx, [].slice.call(arguments))
  }
}

// check if it's a node on the page
function inBody(node) {
  return node
    && node.nodeType == 1
    && document.body.contains(node)
}

// check if it's a valid node
function isNode(node) {
  return node
    && node.nodeType == 1
    && node.nodeName.toLowerCase() == 'source'
    && node.hasAttribute('src')
    && node.getAttribute('src').trim().length > 0
    && node.hasAttribute('media')
    && node.getAttribute('media').trim().length > 0
}

// check if it's a valid object
function isObject(obj) {
  return obj
    && typeof obj.src == 'string'
    && obj.src.trim().length > 0
    && typeof obj.media == 'string'
    && obj.media.trim().length > 0
}

// return an array of objects with 2 keys `name` and `value`
function toArray(data) {
  if (isNode(data)) {
    return Array.prototype.slice.call(data.attributes)
  }
  var arr = []
  if (isObject(data)) {
    for (var k in data) {
      arr.push({
         name: k,
        value: data[k]
      })
    }
  }
  return arr
}

// return an object with filtered names and serialized values
function reducer(prev, curr) {
  var name = curr.name.toLowerCase()
  var value = curr.value

  if (name == 'src' || name == 'media' || name == 'hd') {
    if (typeof value == 'string') {
      value = value.trim()
      if (value.length > 0) {
        prev[name] = value
      }
    }
  } else if (name == 'x' || name == 'y') {
    // check if it's a number -- from https://github.com/jonschlinkert/is-number
    var n = +value
    if ((n - n + 1) >= 0 && value !== '') {
      prev[name] = n
    }
  }

  return prev
}

function Loader(ctx, idx) {
  this.ctx = ctx
  this.idx = idx
  this.done = false
  this.handle = bind(this, this.handle)
}

Loader.prototype.load = function() {
  if (this.done) return this.dispatch()
  // abort if currently loading or error
  if (this.img) return
  this.img = new Image
  this.img.addEventListener('load',  this.handle, false)
  this.img.addEventListener('error', this.handle, false)

  var dpr = window.devicePixelRatio || 1
  var attributes = this.ctx.arr[this.idx].attributes
  this.src = dpr > 1 && attributes.hd ? attributes.hd : attributes.src
  this.img.src = this.src
}

Loader.prototype.handle = function(evt) {
  this.img.removeEventListener('load',  this.handle)
  this.img.removeEventListener('error', this.handle)

  if (evt.type == 'error') {
    throw new Error('QueryLoader can\'t load image "' + this.src + '"')
  }
  else if (evt.type == 'load') {
    this.done = true
    this.dispatch()
  }
}

Loader.prototype.dispatch = function() {
  if (this.ctx.status == killed) return
  var obj = this.ctx.arr[this.idx]

  this.ctx.cb({
           src: this.src,
         width: this.img.naturalWidth,
        height: this.img.naturalHeight,
         media: obj.mql.media,
           img: this.img,
             x: obj.attributes.x != undefined ? obj.attributes.x : .5,
             y: obj.attributes.y != undefined ? obj.attributes.y : .5,
    attributes: obj.attributes,
  })
}
