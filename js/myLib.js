;"use strict";
(function () {
    // Scroll Effect
    function getScrollTop() {
        return document.documentElement.scrollTop || document.body.scrollTop;
    }
    function getScrollHeight() {
        return document.documentElement.scrollHeight || document.body.scrollHeight;
    }
    Element.prototype.scrollSmoothIntoView = function (time) {
        var rect = this.getBoundingClientRect(),
            direction = rect.top > 0 ? 1 : -1,
            steps = time / 40,
            stepValue = Math.abs(rect.top) / steps;
        function isEndOfPage() {
            return (direction == -1 && getScrollTop() == 0)
                || (direction == 1 && getScrollTop() == (getScrollHeight() - window.innerHeight));
        }
        var isOnView = function () {
            return Math.abs(this.getBoundingClientRect().top) < stepValue;
        }.bind(this);
        var timer = setInterval(function () {
            if (isEndOfPage() || isOnView()) {
                window.scrollBy(0, this.getBoundingClientRect().top);
                clearInterval(timer);
                return;
            }
            window.scrollBy(0, stepValue * direction);
        }.bind(this), 40)
    };

// Get width, height, margins, paddings of HTML object (depend on value "display")

    Element.prototype.getHeight = function (display) {
        var display = display || "";
        var old = getComputedStyle(this).display;
        this.style.display = display;
        var height = parseInt(this.offsetHeight);
        this.style.display = old;
        return height;
    };
    Element.prototype.getWidth = function (display) {
        var display = display || "";
        var old = getComputedStyle(this).display;
        this.style.display = display;
        var width = parseInt(this.offsetWidth);
        this.style.display = old;
        return width;
    };

    Element.prototype.getMargins = function (display) {
        var display = display || "";
        var old = getComputedStyle(this).display;
        this.style.display = display;
        var marginTop = parseInt(getComputedStyle(this).marginTop);
        var marginBot = parseInt(getComputedStyle(this).marginBottom);
        var marginLeft = parseInt(getComputedStyle(this).marginLeft);
        var marginRight = parseInt(getComputedStyle(this).marginRight);
        this.style.display = old;
        return {top: marginTop, bot: marginBot, left: marginLeft, right: marginRight};
    };

    Element.prototype.getPaddings = function (display) {
        var display = display || "";
        var old = getComputedStyle(this).display;
        this.style.display = display;
        var paddingTop = parseInt(getComputedStyle(this).paddingTop);
        var paddingBot = parseInt(getComputedStyle(this).paddingBottom);
        var paddingLeft = parseInt(getComputedStyle(this).paddingLeft);
        var paddingRight = parseInt(getComputedStyle(this).paddingRight);
        this.style.display = old;
        return {top: paddingTop, bot: paddingBot, left: paddingLeft, right: paddingRight};
    };

// Get default (css) property of elem

    Element.prototype.getStyleValue = function (styleProperty) {
        var old = this.style[styleProperty];
        this.style[styleProperty] = "";
        var cssValue = getComputedStyle(this)[styleProperty];
        this.style[styleProperty] = old;
        return cssValue;
    };

// Animate fadeIn, fadeOut (opacity)

    Element.prototype.fadeOut = function (time, callBack) {
        var currentOpacity = getComputedStyle(this).opacity;
        var time = time || 1000;
        var steps = time / 40;
        var stepValue = currentOpacity / steps;
        var timer;
        timer = setInterval(function () {
            currentOpacity -= stepValue;
            if (currentOpacity <= 0) {
                clearInterval(timer);
                this.style.display = "none";
                this.style.opacity = "";
                if (callBack) callBack();
                return;
            }
            this.style.opacity = currentOpacity;
        }.bind(this), 40);
        return this;
    };
    Element.prototype.fadeIn = function (time, callBack) {
        var mainOpacity = getComputedStyle(this).opacity;
        var currentOpacity = 0;
        var time = time || 1000;
        var steps = time / 40;
        var stepValue = mainOpacity / steps;
        var timer;
        timer = setInterval(function () {
            currentOpacity += stepValue;
            if (currentOpacity >= mainOpacity) {
                clearInterval(timer);
                this.style.opacity = mainOpacity;
                if (callBack) callBack();
                return;
            }
            this.style.opacity = currentOpacity;
            this.style.display = "";
        }.bind(this), 40);
        return this;
    };

// SlideDown, SlideUp animation

    Element.prototype.slideUp = function (time, callback) {
        var tagStyleText = this.style.cssText;
        var steps = time / 40;
        var height = this.getHeight();
        var stepValue = height / steps;
        var paddingTop = parseInt(getComputedStyle(this).paddingTop);
        var paddingBot = parseInt(getComputedStyle(this).paddingBottom);
        var marginTop = parseInt(getComputedStyle(this).marginTop);
        var marginBot = parseInt(getComputedStyle(this).marginBottom);
        var paddingTopStepValue = paddingTop / steps;
        var paddingBotStepValue = paddingBot / steps;
        var marginTopStepValue = marginTop / steps;
        var marginBotStepValue = marginBot / steps;
        var timer = setInterval(function () {
            height -= stepValue;
            paddingTop -= paddingTopStepValue;
            paddingBot -= paddingBotStepValue;
            marginTop -= marginTopStepValue;
            marginBot -= marginBotStepValue;
            if (height <= 0) {
                clearInterval(timer);
                this.style.cssText = tagStyleText;
                this.style.display = "none";
                if (callback) callback();
                return;
            }
            this.style.overflow = "hidden";
            this.style.height = height + "px";
            this.style.paddingTop = paddingTop + "px";
            this.style.paddingBottom = paddingBot + "px";
            this.style.marginTop = marginTop + "px";
            this.style.marginBottom = marginBot + "px";
        }.bind(this), 40);
        return this;
    };

    Element.prototype.slideDown = function (time, callback) {
        var tagStyleText = this.style.cssText;
        var steps = time / 40;
        var height = this.getHeight();
        var currentHeight = 0;
        var stepValue = height / steps;
        var paddingTop = this.getPaddings().top;
        var paddingBot = this.getPaddings().bot;
        var marginTop = this.getMargins().top;
        var marginBot = this.getMargins().bot;
        var currentPaddingTop = 0;
        var currentPaddingBot = 0;
        var currentMarginBot = 0;
        var currentMarginTop = 0;
        var paddingTopStepValue = paddingTop / steps;
        var paddingBotStepValue = paddingBot / steps;
        var marginTopStepValue = marginTop / steps;
        var marginBotStepValue = marginBot / steps;
        var timer = setInterval(function () {
            currentHeight += stepValue;
            currentPaddingTop += paddingTopStepValue;
            currentPaddingBot += paddingBotStepValue;
            currentMarginBot += marginBotStepValue;
            currentMarginTop += marginTopStepValue;
            if (currentHeight >= height) {
                clearInterval(timer);
                this.style.cssText = tagStyleText;
                this.style.display = "";
                if (!this.style.cssText) this.removeAttribute("style");
                if (callback) callback();
                return;
            }
            this.style.overflow = "hidden";
            this.style.height = currentHeight + "px";
            this.style.paddingTop = currentPaddingTop + "px";
            this.style.paddingBottom = currentPaddingBot + "px";
            this.style.marginTop = currentMarginTop + "px";
            this.style.marginBottom = currentMarginBot + "px";
            this.style.display = "";
        }.bind(this), 40);
        return this;
    };
    Element.prototype.slideToggle = function (time, callback) {
        this.style.display == "none" ? this.slideDown(time, callback) : this.slideUp(time, callback);
    };
    Element.prototype.fadeToggle = function (time, callback) {
        this.style.display == "none" ? this.fadeIn(time, callback) : this.fadeOut(time, callback);
    };

    //Shake animation "x" or "y" directions

    Element.prototype.shake = function (value, direction) {
        var value = value || 30;
        var direction = direction || "x";
        var step = value / 20;
        var marginValue = this.getMargins();
        var i = 0;
        var timer = setInterval(function () {
            if (value <= 0) {
                clearInterval(timer);
                (direction === "y") ? this.style.marginTop = "" : this.style.marginLeft = "";
                return;
            }
            if (direction === "y") this.style.marginTop = marginValue.top + (i % 2 === 0 ? 1 : -1) * value + "px";
            else this.style.marginLeft = marginValue.left + (i % 2 === 0 ? 1 : -1) * value + "px";
            value -= step;
            i++;
        }.bind(this), 40);
        return this;
    };
// реализовать через замыкание описание мелких методов, потом вызов их в методе шэйк прототипа элемента
}());
