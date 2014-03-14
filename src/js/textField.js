/*
Copyright (c) 2013 William Malone (www.williammalone.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*global window, Image */

var BLOCKS;

if (BLOCKS === undefined) {
	BLOCKS = {};
}

BLOCKS.textField = function (options) {
	
	"use strict";
	
	var textField = BLOCKS.eventDispatcher(),
		drawBounds = false,
		context = options.layer.ctx,
		motors = [],
		
		// Private Method
		motorDestroyed = function (motor) {
			
			var i;
			
			motor.removeEventListener("destroyed", motorDestroyed);
			
			for (i = 0 ; i < motors.length; i += 1)  {
				motors.splice(i, 1);
				break;
			}
		};
	
	// Public Properties
	textField.name = (options && options.name !== undefined) ? options.name : undefined;
	textField.width = 0;
	textField.height = 0;
	textField.x = 0;
	textField.y = 0;
	textField.x = options.x || 0;
	textField.y = options.y || 0;
	textField.fontColor = options.fontColor || "#000000";
	textField.fontFamily = options.fontFamily || "Arial,sans";
	textField.fontSize = (options.fontSize && Number(options.fontSize.toString().replace("px", ""))) || 24;
	textField.fontWeight = options.fontWeight || "bold";
	textField.textAlign = options.textAlign || "center";
	textField.prependText = options.prependText || "";
	textField.visible = true;
	textField.dirty = true;
	textField.layer = options && options.layer;
	textField.angle = (options && options.angle);
	textField.alpha = (options && options.alpha);
	textField.scale = (options && options.scale) || 1;
	textField.text = (options && options.text) || "";
	
	// Public Methods
	textField.update = function () {
		
	};
	
	textField.render = function () {
	
		var i, bounds, restoreNeeded, wordArr, curLine, tempLine, xLoc, yLoc;
		
		if (textField.dirty && textField.visible) {
		
			if (textField.angle || textField.alpha !== 1) {
				context.save();
				restoreNeeded = true;
			}
			
			if (textField.alpha !== 1) {
				context.globalAlpha = textField.alpha;
			}
			
			if (textField.angle) {
				context.translate(textField.x, textField.y);
				context.rotate(textField.angle * Math.PI / 180);
				context.translate(-textField.x, -textField.y);
			}
		
			context.fillStyle = textField.fontColor;
			context.font = textField.fontWeight + " " + (Number(textField.fontSize.toString().replace("px", "")) * textField.scale + "px") + " " + textField.fontFamily;
			context.textAlign = textField.textAlign;
			
			wordArr = (textField.prependText + textField.text).split(" ");
			curLine = "";
			
			xLoc = textField.x;
			yLoc = textField.y;
			for (i = 0; i < wordArr.length; i += 1) {
				tempLine = curLine + wordArr[i] + " ";
				if (i && textField.width && context.measureText(tempLine).width > textField.width) {
					context.fillText(curLine, xLoc, yLoc);
					curLine = wordArr[i] + " ";
					yLoc += 20;
				} else {
					curLine = tempLine;
				}
			}
			context.fillText(curLine, xLoc, yLoc);
			
			//context.fillText(textField.prependText + textField.text, textField.x, textField.y);
						
			if (restoreNeeded) {
				context.restore();
			}

			if (drawBounds) {
				bounds = textField.getBounds();
				if (!bounds.length) {
					bounds = [bounds];
				}
				context.lineWidth = 4;

				for (i = 0; i < bounds.length; i += 1) {
				
					if (textField.dragging) {
						context.beginPath();
						context.fillStyle = "rgba(10, 255, 50, 0.4)";
						context.fillRect(bounds[i].x, bounds[i].y, bounds[i].width, bounds[i].height);
						context.closePath();
					} else if (textField.justTapped) {
						context.beginPath();
						context.fillStyle = "rgba(255, 10, 50, 0.4)";
						context.fillRect(bounds[i].x, bounds[i].y, bounds[i].width, bounds[i].height);
						context.closePath();
					} else if (textField.justNotTapped) {
						context.beginPath();
						context.fillStyle = "rgba(255, 10, 255, 0.4)";
						context.fillRect(bounds[i].x, bounds[i].y, bounds[i].width, bounds[i].height);
						context.closePath();
					} else if (textField.justReleased) {
						context.beginPath();
						context.fillStyle = "rgba(125, 10, 255, 0.4)";
						context.fillRect(bounds[i].x, bounds[i].y, bounds[i].width, bounds[i].height);
						context.closePath();
						textField.justReleased = false;
					}
				
					context.beginPath();
					context.strokeStyle = "rgba(255, 80, 0, 0.5)";
					context.strokeRect(bounds[i].x, bounds[i].y, bounds[i].width, bounds[i].height);
					context.closePath();
				}
			}
		}
		textField.dirty = false;
	};
		
	textField.destroy = function () {

		context = null;
		options = null;
		textField = null;
	};
	
	textField.motorize = function (motor) {
	
		motor.addEventListener("destroyed", motorDestroyed);
		motors.push(motor);
	};
	
	textField.stopMotors = function (type) {
		
		var i, motorArr = motors.slice(0);
		
		for (i = 0 ; i < motorArr.length; i += 1)  {
			if (type) {
				if (motorArr[i].type === type) {
					motorArr[i].destroy();
				}
			} else {
				motorArr[i].destroy();
			}
		}
	};
	
	return textField;
};