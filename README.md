## Vertical floating plugin

[demo](scroll.html)

This plugin allows container to scroll through the page with different effects (change of opacity, size)

Movement is affected by Math function (sin, cos, tan) `functionName` parameter

```
var dive = new Dive('#img1', {
		maxDescend: 400,
		functionName: 'sin',
		functionModifier: 9,
		startAfter: 300,
		maxOpacity: .8

	});
```

Movement can be started immediately with the start of the scroll or at the specific scroll value `startAfter`

`maxDescend` specifies the max scroll value before element will disappear
 
 if `maxOpacity` property is not specified default will be set to 1