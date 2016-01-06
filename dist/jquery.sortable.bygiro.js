/* * jQuery / jqLite Sortable ByGiro Plugin * version: 0.0.1 * Author: Girolamo Tomaselli http://bygiro.com * * Copyright (c) 2015 G. Tomaselli * Licensed under the MIT license. */// compatibility for jQuery / jqLitevar bg = bg || false;if(!bg){	if(typeof jQuery != 'undefined'){		bg = jQuery;	} else if(typeof angular != 'undefined'){		bg = angular.element;				(function(){			bg.extend = angular.extend;			bg.isFunction = angular.isFunction;					function selectResult(elem, selector){				if (elem.length == 1)					return elem[0].querySelectorAll(selector);				else {					var matches = [];					for(var i=0;i<elem.length;i++){						var elm = elem[i];						var nodes = angular.element(elm.querySelectorAll(selector));						matches.push.apply(matches, nodes.slice());										}					return matches;				}			}						bg.prototype.is = function (selector){				for(var i=0;i<this.length;i++){					var el = this[i];					if((el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector)) return true;				}				return false;			}						bg.prototype.closest = function(selector){								for(var i=0;i<this.length;i++){					var el = this[i];						while (el) {					  if (bg(el).is(selector)){						return el;					  } else {						el = el.parentNode;					  }					}				}												return false;			};						bg.prototype.find = function (selector){							var context = this[0];				// Early return if context is not an element or document				if (!context || (context.nodeType !== 1 && context.nodeType !== 9) || !angular.isString(selector)) {					return [];				}				var matches = [];				if (selector.charAt(0) === '>')					selector = ':scope ' + selector;				if (selector.indexOf(':visible') > -1) {					var elems = angular.element(selectResult(this, selector.split(':visible')[0]))					forEach(elems, function (val, i) {						if (angular.element(val).is(':visible'))							matches.push(val);					})				} else {					matches = selectResult(this, selector)				}				if (matches.length) {					if (matches.length == 1)						return angular.element(matches[0])					else {						return angular.element(matches);					}				}				return angular.element();			};						function outer(element,type){				if(typeof element == 'undefined') return null;				var method = type == 'width' ? 'offsetWidth' : 'offsetHeight';				return element[method];							}						function size(element,type){				if(typeof element == 'undefined') return null;								var paddingA = 'paddingTop',				paddingB = 'paddingBottom',				method = 'offsetHeight',				computedStyle,result;				if(type == 'width'){					paddingA = 'paddingLeft';					paddingB = 'paddingRight';					method = 'offsetWidth';				}				computedStyle = getComputedStyle(element);				result = element[method];				if (computedStyle)					result -= parseFloat(computedStyle[paddingA]) + parseFloat(computedStyle[paddingB]);				return result;							}						bg.prototype.outerWidth = function () {								return outer(this[0],'width');			};			bg.prototype.width = function () {				return size(this[0],'width');			};			bg.prototype.outerHeight = function(){				outer(this[0]);			};						bg.prototype.height = function () {				size(this[0]);			};						bg.prototype.offset = function () {				var rect = this[0].getBoundingClientRect();				return {					top: rect.top + document.body.scrollTop,					left: rect.left + document.body.scrollLeft				}			};				})();	}	} ;(function ($, document, window){	"use strict";	    var pluginName = "sortableByGiro",    // the name of using in .data()	dataPluginName = "plugin_" + pluginName,	defaults = {		eNames: {			init: "initialized.sortableByGiro",			dropped: "dropped.sortableByGiro",			canceled: "canceled.sortableByGiro",			start: "touchstart.sortableByGiro mousedown.sortableByGiro",			drop: "touchend.sortableByGiro touchleave.sortableByGiro touchcancel.sortableByGiro mouseup.sortableByGiro mouseout.sortableByGiro",			drag: "touchmove.sortableByGiro mousemove.sortableByGiro"		},				/* 		* callback and utility functions		*/				// the context is this plugin data, the $item we are going to drag is in that.dragging.originalItem . if this function return FALSE, the item will not be moved		onDragstart: function(){			return true;		},				// the context is this plugin data, if this function return FALSE, the target is obviously not valid		isValidTarget: function(target){			return true;		},				// the context is this plugin data, if this function return FALSE, the source is not accepted as valid, so we cannot receive any items from the source		// source is a sortableByGiro instance		isValidSource: function(source){			return true;		},						// the context is this plugin data, modification on the fromContainerContext.dragging.item will affect the dropped item		onDrop: function(fromContainerContext){					},				// the context is this plugin data		onCancel: function(){			// executed after drag start BUT when drop has been canceled		},				// If true, the items are assumed to be arranged vertically		vertical: true,		thresholdTarget: 50, // minimum distance between mouse and target container to trigger the closest target available		enabled: true,		clone: false, // should the dragged item be cloned?		drag: true, // can the children items be dragged? it can be a CSS selector OR jQuery/jQLite OR DOM elements of TARGETS where these items could be dropped.		drop: true, // can some element be dropped into this list? it can be a CSS selector OR jQuery/jQLite OR DOM elements of SOURCES from items can be dragged into this list.		itemSelector: '', // It can be a css selector or a jQuery object of the items to look for		handle: '', // The css selector to match the drag handle		dropHandle: '', // The css selector to match the drop handle		draggingClass: 'bg-dragging', // The class given to an item while being dragged		targetsClass: 'bg-sortable-target', // The class given to the available targets		closestTargetClass: 'bg-closest-target', // The class given to the closest target		closestItemClass: 'bg-closest-item', // The class given to the closest target		attrPlaceholder: 'data-sortable-bygiro-placeholder', // The attribute given to the placeholder, it's used internally.		attrDragging: 'data-sortable-bygiro-dragging-item', // The attribute given to the dragging item, it's used internally.		placeholder: '<li class="placeholder"></li>' // Template for the placeholder. Can be any a jQuery element, a DOM element, or a simple HTML string	},		pauseEvent = function(e){		if(e.stopPropagation) e.stopPropagation();		if(e.preventDefault) e.preventDefault();		e.cancelBubble=true;		e.returnValue=false;		return false;	},		getNodeIndex = function (node){				var parent = node.parentNode,		child;		for(var i=0;i<parent.children.length;i++){			child = parent.children[i];			if(child === node){				return i;			}		}	},		isDescendant = function(parent, child) {		var node = child.parentNode;		while (node != null) {			if (node === parent) {				return true;			}			node = node.parentNode;		}		return false;	},		makeid = function(length){		length = length || 15;		var text = "",		possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";		for( var i=0; i < length; i++ )			text += possible.charAt(Math.floor(Math.random() * possible.length));		return text + (new Date()).getTime();	},		sortByDistance = function(elements, mouseX, mouseY, threshold, vertical){		if(!elements || elements.length <= 1) return elements;				var distancesIndex = {},distances = [],		distance,elem,$elem,rect,offset;		for(var i=0;i<elements.length;i++){			elem = elements[i];			$elem = $(elem);			offset = $elem.offset();					distance = Math.floor(Math.sqrt(Math.pow(mouseX - (offset.left+($elem.height() /2)), 2) + Math.pow(mouseY - (offset.top+($elem.height() /2)), 2)));						if(threshold && distance > threshold) continue;						distance = distance + i;			distances.push(distance);			distancesIndex[distance] = i;		}		distances.sort();		var result = [];		for(var i in distances){			result[i] = elements[distancesIndex[distances[i]]];		}		return result;	},		getPlaceholder = function(){		var opts = this.options,		placeholder = opts.placeholder;				if(!(placeholder instanceof $)){			placeholder = $(placeholder);		}				return placeholder			.attr(opts.attrPlaceholder,'')			.wrap('<div></div>')			.parent()			.html();	},		getElements = function(rawElement){		var result = false, tmp;				if(typeof rawElement == 'string'){			result = $(rawElement);		} else if(rawElement instanceof $){			result = rawElement;		} else if(rawElement instanceof Array){			result = rawElement;		} else if(rawElement) {			result = [rawElement];					}				if(result){			tmp = [];			for(var e=0;e<result.length;e++){				tmp.push(result[e]);			}			result = tmp;		}				return result || [];	},			canDrop = function(fromElement, test){		var that = this,		opts = that.options,		tmp,		source,		isValid,		cleanSources,		acceptableSources;		// drop not enabled		if(!opts.drop) return false;				cleanSources = getElements(fromElement);				// check AGAIN drop attribute, for valid acceptable sources		acceptableSources = opts.drop !== true ? getElements(opts.drop) : [];		for(var i=0;i<cleanSources.length;i++){			source = cleanSources[i];			if(acceptableSources.length && acceptableSources.indexOf(source) < 0){				//cleanSources.splice(i,1);				continue;			}						// check isValidSource			if(typeof opts.isValidSource == 'function'){				if(!opts.isValidSource.call(that,$(source))) continue;			}						return true;		}				return false;	},		findTarget = function(event){		var that = this,		opts = that.options,		valid,		mouseOnElement = false,		validTargets = [],		targets,		placeholder = getPlaceholder.call(that),		closestItem,		closestItems,		isAfter,		pluginData,		eventTarget,		targ,		upper,		source = that.$element;		// remove targetsClass closestTargetClass		var $body = $('body');		$body.find('.'+ opts.closestTargetClass).removeClass(opts.closestTargetClass);		$body.find('.'+ opts.targetsClass).removeClass(opts.targetsClass);		$body.find('.'+ opts.closestItemClass).removeClass(opts.closestItemClass);						// get base elements		targets = getElements(that.$element);				// add extra elements in opts.drag		if(opts.drag && opts.drag !== true){			targets = targets.concat(getElements(opts.drag));		}		// remove placeholder		$body			.find('['+ opts.attrPlaceholder +']')			.remove();				// remove targets from dragged item...if any		if(that.dragging){			var found = that.dragging.item.find(targets);						if(found.length){				for(var i=0;i<found.length;i++){					for(var t=0;t<targets.length;t++){						if(found[i] === targets[t]){							targets.splice(t,1);							break;						}					}				}			}			source = that.dragging.oldContainer;		}				// check if targets are valid		for(var i=0;i<targets.length;i++){			valid = true,			targ = targets[i];						// let's firstly check if this target is valid for us			if(typeof opts.isValidTarget == 'function'){				valid = opts.isValidTarget.call(that,$(targ));			}									// if target is still valid, let's see if it has a valid sortable instance, let's check if we are allowed to drop items			var targetData = $(targ).data(dataPluginName);			if(valid && targetData){				valid = targetData.canDrop(source);			}						if(valid) validTargets.push(targ);		}						var eventPageX = event.pageX,		eventPageY = event.pageY;				eventTarget = document.elementFromPoint(eventPageX - window.pageXOffset, eventPageY - window.pageYOffset) || event.target;				function haveWeTarget(elem){			return (elem && elem.length);		}				// is it a sublist		if(validTargets.indexOf(eventTarget)>=0){			mouseOnElement = $(eventTarget);		}				// firstly let's detect if there are sublists		if(!haveWeTarget(mouseOnElement) && (!opts.dropHandle || (opts.dropHandle.length && $(eventTarget).is(opts.dropHandle)))){			mouseOnElement = getUpDownTargets.call(that, eventTarget, validTargets, 1);						// let's check distance			mouseOnElement = sortByDistance(mouseOnElement, eventPageX, eventPageY, opts.thresholdTarget);		}				// then let's detect if there are parent lists		if(!haveWeTarget(mouseOnElement)) mouseOnElement = getUpDownTargets.call(that, eventTarget, validTargets);			if(!haveWeTarget(mouseOnElement)){			mouseOnElement = sortByDistance(validTargets, eventPageX, eventPageY, opts.thresholdTarget);		}				// add opts.targetsClass		$(validTargets).addClass(opts.targetsClass);						if(!haveWeTarget(mouseOnElement)) return;		// addClass to closest container		$(mouseOnElement[0]).addClass(opts.closestTargetClass);				// check mouse is ON the closest target		if(eventTarget !== mouseOnElement[0] && $(eventTarget).closest(mouseOnElement[0]).length <= 0){			return;		}						pluginData = getUpDownTargets.call(that,mouseOnElement[0]);		if(pluginData.length){			pluginData = pluginData.data(dataPluginName);		} else {			pluginData = that;		}						// find closest items inside the closest target		closestItems =  pluginData.getItems(mouseOnElement[0]) || [];				var isValidPrevItem = that.prevClosestItem && $(that.prevClosestItem).closest(validTargets)[0] === $(that.prevClosestItem).closest(mouseOnElement[0])[0];				closestItem = false;		if(closestItems.length == 1){			closestItem = closestItems[0];		} else {					var previousClosest = false;			for(var i=0;i<closestItems.length;i++){				if(eventTarget === closestItems[i] || $(eventTarget).closest(closestItems[i]).length){					closestItem = closestItems[i];					break;				}								if(isValidPrevItem && closestItems[i] === that.prevClosestItem){					previousClosest = that.prevClosestItem;				}			}						if(!closestItem && previousClosest){				closestItem = previousClosest;			}						if(!closestItem){				closestItems = sortByDistance(closestItems, eventPageX, eventPageY);				closestItem = closestItems[0];			}		}		if(!closestItem){			$(mouseOnElement[0]).append(placeholder);			return;		}				// add class to closest element		$(closestItem).addClass(opts.closestItemClass);		isAfter = elementIsAfter($(closestItem),event,opts.vertical);		closestItem.insertAdjacentHTML((isAfter ? 'afterend' : 'beforebegin'), placeholder);				that.prevClosestItem = closestItem;	},		elementIsAfter = function($element,event,vertical){		var offset = $element.offset(),		top = offset.top,		left = offset.left,isAfter;				if(vertical){			top += ($element.height() / 2); // top			isAfter = (event.pageY - top) >= 0; // is below		} else {			left += ($element.width() / 2); // left			isAfter = (event.pageX - left) >= 0; // is on right		}				return isAfter;	},		getUpDownTargets = function(item, validParents, goDown){		var that = this,		found = false,		parent,		children,		isValidParent,		otherParent;				goDown = goDown || false;				if(validParents && !validParents.length) return;				if(!item){			if(!that.dragging) return;					item = that.dragging.item;		} else if(!(item instanceof $)){			item = $(item);		}		parent = item;		while(!found && parent.length && !parent.is('html')){			for(var p=0;p<parent.length;p++){				otherParent = $(parent[p]);								isValidParent = typeof otherParent.data(dataPluginName) != 'undefined';				if(validParents){					isValidParent = validParents.indexOf(otherParent[0]) >= 0 ? true : false;				}								if(isValidParent){					found = true;					break;				}			}						if(!found){				if(!goDown){					parent = parent.parent();				} else {					parent = parent.children();				}			}		}		return found ? otherParent : false;	},		getItems = function(fromElement){		var that = this,elements,		cleanElements,		itemsToBeDragged = that.options.itemSelector;				if(fromElement){			// get this instance targets			elements = [];			for(var e=0;e<that.$element.length;e++){				elements.push(that.$element[e]);			}						cleanElements = getElements(fromElement);			for(var e=0;e<cleanElements.length;e++){								if(elements.indexOf(cleanElements[e]) < 0){									elements.push(cleanElements[e]);				}			}						var itemsByElement = [],items,ele, subEle;							for(var e=0;e<elements.length;e++){				ele = $(elements[e]);								if(!itemsToBeDragged || !itemsToBeDragged.length){					items = ele.children();				} else {					items = ele.find(itemsToBeDragged);				}								itemsByElement[e] = getElements(items);			}					for(var e=0;e<elements.length;e++){				ele = elements[e];				items = itemsByElement[e];				for(var i=0;i<elements.length;i++){					subEle = elements[i];					// is this descendant					if(isDescendant(ele, subEle)){						items.filter(function(el){						  return itemsByElement[i].indexOf(el)<0;						});						}				}				itemsByElement[e] = items;			}						var eleIndex,result = [];			for(var i=0;i<cleanElements.length;i++){				eleIndex = elements.indexOf(cleanElements[i]);				result = result.concat(itemsByElement[eleIndex]);			}						itemsToBeDragged = $(result);		} else {			if(!itemsToBeDragged || !itemsToBeDragged.length){				itemsToBeDragged = that.$element.children();			} else {				itemsToBeDragged = that.$element.find(itemsToBeDragged);			}		}		return itemsToBeDragged;	},		eventsHandler = function(detach, allEvents){		var that = this,		opts = that.options,		parent,		events,		itemsToBeDragged = !detach || allEvents ? getItems.call(that) : 0,		hasHandler;				if(detach){						$('body').off(opts.eNames.drag);			$('body').off(opts.eNames.drop);			if(allEvents) that.$element.off(opts.eNames.start);			return;		}				var eleToMatch = (opts.itemSelector && opts.itemSelector.length) ? opts.itemSelector : that.$element.children();		that.$element			.on(opts.eNames.start, function(e){						var parent = $(e.target), $item = false;			while(parent.length && !parent.is(that.$element)){				if(parent.is(eleToMatch)){					$item = parent;					break;				}				parent = parent.parent();			}						if(!$item) return;						var start = true;			if(opts.handle.length){				start = false;				if($(e.target).is(opts.handle)){					start = true;				}			}			if(start) dragstart.call(that,e, $item);		});			},		removeGhosts = function(){		var opts = this.options,body = $('body');		// remove placeholder if any		body.find('['+ opts.attrPlaceholder +'],['+ opts.attrDragging +']').remove();		body.find('.'+ opts.closestTargetClass).removeClass(opts.closestTargetClass);		body.find('.'+ opts.targetsClass).removeClass(opts.targetsClass);		body.find('.'+ opts.closestItemClass).removeClass(opts.closestItemClass);	},		drop = function(){		var that = this,		opts = this.options,		dropIt = false,		target = $('body').find('['+ opts.attrPlaceholder +']'),		$item;				if(!that.dragging){						opts.onCancel.call(that);			that.$element.triggerHandler(opts.eNames.canceled, that);						delete that.dragging;			removeGhosts.call(that);			eventsHandler.call(that,1);			return;		}		that.dragging.target = target;			if(target.length){			var targetParent = getUpDownTargets.call(that, target),			targetParentData = false;			that.dragging.newContainer = target.closest('.'+ opts.targetsClass);			that.dragging.newIndex = getNodeIndex(target[0]);			dropIt = true;						if(targetParent){				targetParentData = targetParent.data(dataPluginName);				if(targetParentData){					if(!that.dragging.oldContainer){						if(!targetParentData.canDrop(that.dragging.oldContainer)) dropIt = false;					}					if(dropIt && typeof targetParentData.options.onDrop == 'function'){						targetParentData.options.onDrop.call(targetParentData,that);					}				}			}					}		$item = that.dragging && that.dragging.item ? that.dragging.item : false;		if($item){						$item				.removeClass(opts.draggingClass)				.removeAttr(opts.attrDragging)				.css({					position: '',					left: '',					top: ''				});						if(dropIt){				that.dragging.target.replaceWith(that.dragging.item);										if(targetParentData){					targetParentData.$element.triggerHandler(opts.eNames.dropped, that);					targetParentData.reInitHandler();				} else {					that.$element.triggerHandler(opts.eNames.dropped, that);					that.reInitHandler();				}			} else {				opts.onCancel.call(that);				that.$element.triggerHandler(opts.eNames.canceled, that);								if(opts.clone){					if(that.dragging.item) that.dragging.item.remove();				} else {										// no target found let's put it back 					var container = that.dragging.oldContainer,					oldIndex = that.dragging.oldIndex,					sibEle = false,					$item = that.dragging.item;										if(container){												if(oldIndex>0){														// find sibling elements							var siblings = getItems.call(that,container);							if(siblings.length){								oldIndex = siblings[oldIndex] ? oldIndex : siblings.length-1;								sibEle = $(siblings[oldIndex]);							}						}												if(sibEle){							sibEle.after($item);													} else {							container.prepend($item);						}					}				}							}		}				delete that.dragging;		removeGhosts.call(that);		eventsHandler.call(that,1);	},		dragstart = function(event, $item){		var that = this,		opts = that.options,		isValidToBeMoved = true,		targets;		pauseEvent(event);				// is this list enabled?		if(!opts.enabled) return;				targets = getElements(that.$element);				// add extra elements in opts.drag		if(opts.drag && opts.drag !== true){			targets = targets.concat(getElements(opts.drag));		}						that.dragging = {						oldIndex: getNodeIndex($item[0]),			originalItem: $item,			item: opts.clone ? $item.clone(true) : $item,			oldContainer: getUpDownTargets.call(that,$item, targets)		};		// check it's a valid item to move		if(typeof opts.onDragstart == 'function'){			isValidToBeMoved = opts.onDragstart.call(that, $item);		}				if(!isValidToBeMoved){			delete that.dragging;			removeGhosts.call(that);			eventsHandler.call(that,1);			return;		}		findTarget.call(that,event);				that.dragging.item			.addClass(opts.draggingClass)			.attr(opts.attrDragging,"")			.css({				position: 'absolute',				left:  event.pageX+10,				top:   event.pageY+5			});		// append item to body to avoid "position: relative" of the parent's item		$('body')			.append(that.dragging.item)			.on(opts.eNames.drag, function(e){ // add eventhandler to move item and follow the mouse				pauseEvent(e);								if(!that.dragging){					removeGhosts.call(that);					eventsHandler.call(that,1);					return;				}								that.dragging.item.css({				   left:  e.pageX+10,				   top:   e.pageY+5				});								findTarget.call(that,e);			})			.on(opts.eNames.drop, function(e){				if(e.type == 'mouseout'){					if(e.relatedTarget !== document.querySelector('html')){						return;					}										// mouse out of window					$('body').find('['+ opts.attrPlaceholder +'],['+ opts.attrDragging +']').remove();				}				pauseEvent(e);								drop.call(that);			});	},		methods = {		init: function (element, options) {			var that = this,inlineData,opts;						that.$element = $(element);						// check we have some data on the element			inlineData = that.$element.data();			opts = that.options = $.extend({},	defaults, inlineData, options);			that.$element.triggerHandler(opts.eNames.init, that);			eventsHandler.call(that);		},				// fromElement could be: a DOM, a jQuery/jQLite, a CSS selector		getItems: function(fromElement){			return getItems.call(this, fromElement);		},				reInitHandler: function(){			eventsHandler.call(this, 1, 1); // remove events handlers			eventsHandler.call(this);		},				// fromElement could be: a DOM, a jQuery/jQLite, a CSS selector		canDrop: function(fromElement){			return canDrop.call(this, fromElement);		}	};		    var main = function (method) {		var thisPlugin = this.data(dataPluginName);		if (thisPlugin) {			if (typeof method === 'string') {				if(thisPlugin[method]){					return thisPlugin[method].apply(thisPlugin, Array.prototype.slice.call(arguments, 1));				} else {					return console.log('Method ' + method + ' does not exist on jQuery / jqLite ' + pluginName);				}				            }					} else {			if (!method || typeof method === 'object') {				thisPlugin = $.extend({}, methods);				thisPlugin.init(this, method);				this.data(dataPluginName, thisPlugin);				return this;            }            return console.log( pluginName +' is not instantiated. Please call $("selector").'+ pluginName +'({options})');        }    };	// plugin integration	if($.fn){		$.fn[ pluginName ] = main;	} else {		$.prototype[ pluginName ] = main;	}	$(document).ready(function(){		var mySelector = document.querySelector('[data-sortable-init]');		if($(mySelector).length) $(mySelector)[ pluginName ]({});	});}(bg, document, window));