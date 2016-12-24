function Dive(selector, params) {
	if (!params) params = {};
	this.params = params;
	this.selector = selector;
	this.addWrapper();
	this.wrapperClass = params.wrapperClass || 'block';
	this.body = document.querySelector('body');
	this.maxWidth = params.maxWidth || 400;
	this.maxHeight = params.maxHeight || 400;
	this.hPosition = this.obj.offsetLeft;
	this.vPosition = this.obj.offsetTop + this.body.getBoundingClientRect().top;
	this.minWidth = params.minWidth || parseFloat(this.computedStyle.width);
	this.minHeight = params.minHeight || parseFloat(this.computedStyle.height);
	this.initOpacity = parseFloat(this.computedStyle.opacity);
	this.startAfter = params.startAfter || 0;
	// block which will remain in the place while "obj" will move
	this.currentBodyTop = this.body.getBoundingClientRect().top;
	this.opacityChangeTop = params.opacityChangeTop || -450;
	this.maxDescend = params.maxDescend || 600;
	this.maxOpacity = params.maxOpacity || 1;
	this.prevTop = -this.startAfter || 0;
	this.prevTopSave = this.prevTop;
	this.f = this.move.bind(this);
	this.savedWidth = parseInt(this.obj.clientWidth);
	this.savedHeight = this.obj.clientHeight;
	this.savedOpacity = parseFloat(this.computedStyle.opacity);
	this.tmpTop = null;
	this.functionModifier = 70;
	this.maxOpacityPercent = params.maxOpacityPercent || 30;
	this.minOpacityPercent = params.minOpacityPercent || 80;
	this.opacityIncrement = params.opacityIncrement || 0.02;
	this.functionName = params.functionName || 'cos';
	window.addEventListener('scroll', this.f);
	this.f();
}
/**
 * moves container
 * @returns {boolean}
 */
Dive.prototype.move = function () {
	this.currentBodyTop = this.body.getBoundingClientRect().top;

	var width = parseInt(this.obj.clientWidth);
	var height = this.obj.clientHeight;
	var inc = this.prevTop - (this.currentBodyTop);

	this.opacity = parseFloat(this.computedStyle.opacity);
	this.newWidth = width + inc;
	this.newHeight = height + inc;
	this.newOpacity = this.opacity + this.opacityIncrement * inc;
	this.checkOpacity();
	this.zIndex = 1;
	// it reaches max limits
	if ((this.currentBodyTop - this.prevTopSave - this.savedWidth) < -this.maxWidth) {
		this.newWidth = this.maxWidth;
		this.newHeight = this.maxHeight;
	}
	this.position = 'fixed';
	// limits
	if (this.newWidth < this.minWidth) {
		this.newWidth = this.minWidth
	}
	if (this.newHeight < this.minHeight) {
		this.newHeight = this.minHeight
	}
	if (this.newOpacity < this.initOpacity) {
		this.newOpacity = this.initOpacity;
	}
	if (this.newWidth > this.maxWidth) {
		this.newWidth = this.maxWidth
	}
	if (this.newHeight > this.maxHeight) {
		this.newHeight = this.maxHeight;
	}

	this.backToHome();

	/**
	 * starting execution after reach specific height
	 */
	if (!!this.startAfter && this.currentBodyTop > -this.startAfter && !this.isStarted) {
		this.prevTop = this.currentBodyTop;
		this.tmpTop = null;
		return false;
	}
	this.isStarted = true;

	/**
	 *  here we start to reduce opacity
	 */
	if (this.currentBodyTop < this.opacityChangeTop) {
		// func from top
		this.newOpacity = this.opacity - this.opacityIncrement * inc;
		this.checkOpacity();
		this.zIndex = this.newOpacity <= 0 ? '-1' : '1';
	}
	if (!this.tmpTop) {
		this.topPosition = this.prevTop + this.obj.offsetTop;
		this.tmpTop = this.topPosition;
	} else {
		this.topPosition = this.tmpTop;
	}
	this.topPosition += -Math[this.functionName](this.currentBodyTop / this.functionModifier) * 20;
	this.setStyles();
	this.backToHome();

	/**
	 * callback after specified top is reached
	 */
	if (!!this.params.triggerAfter && this.currentBodyTop <= this.params.triggerAfter && this.params.cb) {
		this.params.cb();
	}
	this.applyStyles();
	this.prevTop = this.prevTop - inc;
};
/**
 * returns opacity as a function of scroll position
 * @param vPosition
 * @returns {Number|*}
 */
Dive.prototype.getOpacity = function (vPosition) {
	if (vPosition < 0) vPosition = -vPosition;
	var maxDescend = (this.maxDescend + this.startAfter);
	var firstOpacityMax = this.startAfter + this.maxDescend / 100 * this.maxOpacityPercent;
	var firstOpacityMin = this.startAfter + this.maxDescend / 100 * this.minOpacityPercent;
	var firstPercent = (firstOpacityMax - this.startAfter) / 100;
	var newOpacity = this.initOpacity;
	// first part
	if (vPosition > this.startAfter) {
		newOpacity = parseFloat(this.initOpacity + this.initOpacity * (vPosition / firstPercent) / 100).toFixed(2);
	}
	// mid part
	if (vPosition >= firstOpacityMax && vPosition <= firstOpacityMin) {
		newOpacity = this.maxOpacity;
	}
	// last part
	if (vPosition > firstOpacityMin && vPosition < maxDescend) {
		var startOfZone = firstOpacityMin;
		var percentLast = (maxDescend - startOfZone) / 100;
		newOpacity = (this.maxOpacity - (vPosition - startOfZone) / percentLast / 100).toFixed(2);
	}
	// after all
	if (vPosition >= maxDescend) {
		newOpacity = 0;
	}
	return newOpacity;
};

/**
 * opacity needs to fit MaxOpacity limit
 */
Dive.prototype.checkOpacity = function () {
	if (this.newOpacity > this.maxOpacity) {
		this.newOpacity = this.maxOpacity;
	}
};
/**
 * setting styles
 */
Dive.prototype.setStyles = function () {
	if (!this.backgroundImage) {
		this.backgroundImage = window.getComputedStyle(this.obj)['background-image'];
	}
	// if (!this.initOpacity) {
	// 	this.initOpacity = window.getComputedStyle(this.obj)['opacity'];
	// }
	this.styles = [
		{margin: 0},
		{padding:0},
		{width: parseInt(this.newWidth) + 'px'},
		{height: parseInt(this.newHeight) + 'px'},
		{opacity: this.getOpacity(this.currentBodyTop)},
		{top: this.topPosition + 'px;'},
		{position: this.position},
		{'z-index': this.zIndex},
		{left: this.hPosition - (this.newWidth - this.savedWidth) / 2 + 'px'},
		{'background-image': this.backgroundImage}
	];
};
/**
 * when the object crossed the point of execution it turns to static
 */
Dive.prototype.backToHome = function () {
	if (this.currentBodyTop >= (-this.startAfter || 0)) {
//			console.log('back at home', this.obj.getAttribute('id'), this.vPosition);
		this.topPosition = this.vPosition;
		this.position = 'static';
		this.newWidth = this.savedWidth;
		this.newHeight = this.savedHeight;
		this.newOpacity = this.savedOpacity;
		this.isStarted = false;
		this.setStyles();
		this.applyStyles();
	}
};
/**
 * here we merge and apply styles array
 */
Dive.prototype.applyStyles = function () {
	if (!this.styles) {
		console.log('no styles found');
		return;
	}
	var st = this.styles.map(function (elem) {
		return Object.keys(elem)[0] + ':' + Object.values(elem)[0];
	}).join(';');
	this.obj.setAttribute('style', st);
};

/**
 * some cleaning
 */
Dive.prototype.destroy = function () {
	console.log('destroy');
	window.removeEventListener('scroll', this.f);
};

/**
 * modifier for scrolling function
 * @param modifier
 */
Dive.prototype.setTanModifier = function (modifier) {
	this.functionModifier = modifier * 10;
};
/**
 * wrapper for element to keep other parts of html intact
 */
Dive.prototype.addWrapper = function () {
	var wrap = document.createElement('div');
	var source = document.querySelector(this.selector);
	this.computedStyle = window.getComputedStyle(source);
	wrap.setAttribute('class', this.wrapperClass);
	wrap.appendChild(source.cloneNode(true));
	var styles = [
		{width: this.computedStyle.width},
		{height: this.computedStyle.height},
		{float: this.computedStyle.float},
		{padding: this.computedStyle.padding},
		{margin: this.computedStyle.margin},
	];
	styles = styles.map(function (elem) {
		return Object.keys(elem)[0] + ':' + Object.values(elem)[0]
	});
	wrap.setAttribute('style', styles.join(';'));

	source.parentNode.insertBefore(wrap, source);
	source.remove();
	this.obj = document.querySelector(this.selector);
	this.computedStyle = window.getComputedStyle(this.obj);
	this.setStyles();
	this.applyStyles();
};