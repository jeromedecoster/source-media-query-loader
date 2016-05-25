
const QueryLoader = require('..')

var img = document.querySelector('img')

var buttons = [].slice.call(document.querySelectorAll('button'))
buttons.forEach(e => e.action = e.getAttribute('action'))

var ql

function update(selector, display) {
  [].slice.call(document.querySelectorAll(selector)).forEach(e => e.style.display = display)
}

update('[step=two] button', 'none')

buttons.forEach(e => e.addEventListener('click', (e) => {

  update('[step=one] button', 'none')
  update('[step=two] button', 'inline-block')

  if (!ql) {
    ql = QueryLoader(function(data) {
      console.log('cb data:', data)
      img.src = data.src
    })
  }

  var action = e.target.action
  console.log('action:', action)

  if (action == 'add-good-node') {
    ql.add(document.querySelector('#good :nth-child(1)'))
    ql.add(document.querySelector('#good :nth-child(2)'))
    ql.add(document.querySelector('#good :nth-child(3)'))
  }
  else if (action == 'find-bad-node') {
    ql.find(document.querySelector('#bad'))
  }
  else if (action == 'add-good-object') {
    ql.add({
      src:"lizard.jpg",
      x:"0.663774403",
      // y:-0.375375375,
      fake: 12,
      hd:"lizard-hd.jpg",
      media:"(width <= 700px)"
    })
  }
  else if (action == 'add-bad-object') {
    ql.add({src:'12', media:' d', bob:13, 'x':'123'})
  }
  else if (action == 'start') {
    ql.start()
  }
  else if (action == 'start-node') {
    ql.start(img, 200)
    // ql.start(12, 200)
    // ql.start(document.createElement('img'), 200)
  }
  else if (action == 'stop') {
    ql.stop()
  }
  else if (action == 'kill') {
    ql.kill()
  }
  else if (action == 'margin') {
    document.querySelector('.no-margin').classList.add('margin')
  }
}))
