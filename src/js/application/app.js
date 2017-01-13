(function (angular) {
	'use strict';

	angular.module('app', [])
		.controller('HomeCtrl', function ($scope, $filter) {
			$scope.width = 120;
			$scope.height = 120;

			$scope.gcd = function (a, b) {
				return (b == 0) ? a : $scope.gcd(b, a % b);
			};
		})
		.directive('dragger', function () {
			return {
				scope: {
					strictRatio: '=',
					width: '=',
					height: '='
				},
				restrict: 'A',
				link: function (scope, element, attrs) {
					interact('.resize-drag')
						.draggable({
							restrict: {
								restriction: 'parent',
								endOnly: true,
								elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
							},
							onmove: window.dragMoveListener
						})
						.resizable({
							preserveAspectRatio: scope.strictRatio,
							edges: { left: true, right: true, bottom: true, top: true }
						})
						.on('resizemove', function (event) {
							var target = event.target,
								x = (parseFloat(target.getAttribute('data-x')) || 0),
								y = (parseFloat(target.getAttribute('data-y')) || 0);

							// update the element's style
							target.style.width = event.rect.width + 'px';
							target.style.height = event.rect.height + 'px';

							// translate when resizing from top or left edges
							x += event.deltaRect.left;
							y += event.deltaRect.top;

							target.style.webkitTransform = target.style.transform =
								'translate(' + x + 'px,' + y + 'px)';

							target.setAttribute('data-x', x);
							target.setAttribute('data-y', y);

							scope.width = Math.round(event.rect.width);
							scope.height = Math.round(event.rect.height);
							scope.$apply();
						});

					var watchRatio = scope.$watch('strictRatio', function (newValue, oldValue) {
						if (!_.isEqual(newValue, oldValue)) {
							interact('.resize-drag')
								.resizable({
									preserveAspectRatio: newValue
								});
						}
					});

					var watchWidth = scope.$watch('width', function (newValue, oldValue) {
						if (!_.isEqual(newValue, oldValue)) {
							angular.element('.resize-drag').css('width', newValue + 'px');
						}
					});

					var watchHeight = scope.$watch('height', function (newValue, oldValue) {
						if (!_.isEqual(newValue, oldValue)) {
							angular.element('.resize-drag').css('height', newValue + 'px');
						}
					});

					scope.$on('$destroy', function () {
						watchRatio();
						watchWidth();
						watchHeight();
					});
				}
			};
		});


	window.dragMoveListener = function (event) {
		var target = event.target,
			// keep the dragged position in the data-x/data-y attributes
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// translate the element
		target.style.webkitTransform =
			target.style.transform =
			'translate(' + x + 'px, ' + y + 'px)';

		// update the posiion attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	};
})(angular);