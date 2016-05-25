# source-media-query-loader

> Load image according to media queries and source nodes

## Install

```bash
npm i source-media-query-loader
```

## API

#### QueryLoader(cb)

Create instance with the callback

The callback receive an object with 8 properties

| Argument | Value |
| :------ | :------- |
| **src** | the image source |
| **width** | the image naturalWidth |
| **height** | the image naturalHeight |
| **media** | the media query |
| **img** | the image node |
| **x** | the x focus point ratio, default to .5 |
| **y** | the y focus point ratio, default to .5 |
| **attributes** | an object with the original attributes values |

```js
var ql = QueryLoader(function(data) {
  // {src:"image.jpg", width:320, height:240, media:"(max-width: 700px)", img:img, x:.5, y:.5, attributes:object}
  console.log(data)
})

ql.start()
```

#### add(data)

Add a source to the QueryLoader

Argument `data` can be a `dom node` or a `javascript object`

| Format | Value |
| :------ | :------- |
| **node** | `<source src="image.jpg" media="(width <= 700px)"/>` |
| **object** | `{src:"image.jpg", media:"(width <= 700px)"}` |

The properties `src` and `media` are required

#### find(node)

Add all `<source>` child of `node`

```html
<div id="ref">
  <source src="small.jpg" x="0.663774403" y="0.375375375" hd="small-hd.jpg" media="(width <= 700px)"/>
  <source src="medium.jpg" x=".363" y=".484257871" media="(900px >= width > 700px)" />
  <source src="large.jpg" media="(width > 900px)" />
</div>
```

```js
ql.find(document.querySelector('#ref'))
```

#### start([node], [offset])

Start the instance

If `node` is defined, starts the lazy loading mode. The image will be loaded if `node` will enter the viewport

The argument `offset` is only used in lazy mode. The argument is optional, default to `200`

#### stop()

Stop the instance. The callback will no more be invoked

#### kill()

Kill the instance. Listeners and memory are cleared

## License

MIT
