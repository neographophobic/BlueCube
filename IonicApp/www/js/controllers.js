var app = angular.module('BlueCube.controllers', [])

// Controller for the application
app.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});
});

// Controller for the 'All' page
app.controller('AllCtrl', function($ionicPlatform, $scope, $cubeAction, ColourService, $localstorage) {
	// Get whether the user wishes to send colour updates directly to the cube as they are picked,
	// or whether they want to want until they specifically send the colour.
	if ($localstorage.get('liveAllColourChanges', 'true') == "true") {
		// Either no setting was set, or the user wants to make live changes

		// Indicate that we are in live mode
		$scope.live = true;

		// Hide the button to manually send colour changes
		$scope.useSelectedColourButton = false;
	} else {
		// Indicate that we are not in live mode
		$scope.live = false;

		// Show the button to manually send colour changes
		$scope.useSelectedColourButton = true;
	}

	// Flag that deleting and re-ordering of the favourite colours list is off by default
	$scope.data = {
		showDelete: false,
		showReordering: false,
	};

	$scope.$on('$ionicView.beforeEnter', function() {
		// Get the list of favourite colours and store it in the colours array before the
		// page is loaded.
		$scope.colours = ColourService.list();
	});

	$ionicPlatform.ready(function() {
		// Get the initial colour to set the colour selector to
		var initialColour = $localstorage.get('selectedColour', '00d1ff');

		// Make the colour available to the view
		$scope.hexColour = initialColour;

		// Set the colour selector to the initial colour
		initialColour = '#' + initialColour;
		$scope.colour = {targetColor: initialColour};

		// Make the list of colour favourites available to the view
		$scope.colours = ColourService.list();

		// What for when the user selects a new colour via the colour picker
		$scope.$watchCollection('colour.targetColor', function(newValue, oldValue) {
			if (newValue != oldValue) {
				// The colour has changed so track it

				// The colour is returned as #XXXXXX whereas we don't required the #,
				// so get only the hex part of the colour string
				$scope.hexColour = newValue.substring(1);

				// Save the choice for future reference
				$localstorage.set('selectedColour', $scope.hexColour);

				if ($scope.live == true) {
					// We are in live mode, so build the message to send to the cube
					var message = "all " + $scope.hexColour + ";";

					// Submit the message to the cube, and add it to the history
					$cubeAction.sendMessage(message, true);
				}
			}
		});
	});

	$scope.liveChanged = function() {
		// Called whenever the "Automatically Change" toggle is changed

		if ($scope.live == false) {
			// User wants to enable live mode

			// Flag we are in live mode, and save this choice
			$scope.live = true;
			$localstorage.set('liveAllColourChanges', 'true');

			// Hide the button to manually change the colour
			$scope.useSelectedColourButton = false;
		} else {
			// User wants manual mode

			// Flag we are in manual mode, and save this choice
			$scope.live = false;
			$localstorage.set('liveAllColourChanges', 'false');

			// Show the button to manually change the colour
			$scope.useSelectedColourButton = true;
		}
	};

	$scope.sendSelectedColour = function(selectedColour) {
		// The user has either clicked one of the colour favourites, or manually
		// wishes to change the colour

		if (selectedColour == null) {
			// No colour was provided, so it's a manual colour change. As such use the
			// colour that has been selected via the colour picker
			selectedColour = $scope.hexColour;
		}

		// Build the message to send to the cube
		var message = "all " + selectedColour + ";";

		// Submit the message to the cube, and add it to the history
		$cubeAction.sendMessage(message, true);
	};

	$scope.addUserColour = function () {
		// Save the currently selected colour to the favourites list
		ColourService.add($scope.hexColour);
	};

	$scope.deleteUserColour = function (id) {
		// Delete the colour favourite with the provided id.
		ColourService.delete(id);
	};

	$scope.reorderItem = function(item, fromIndex, toIndex) {
		// Reorder the favourite colours list
		ColourService.reorder(item, fromIndex, toIndex);
	};
});

// Controller for the 'Shift' page
app.controller('ShiftCtrl', function($ionicPlatform, $scope, $cubeAction) {
	$scope.up = function () {
		// Up button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift Z +;', true);
	};

	$scope.down = function () {
		// Down button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift Z -;', true);
	};

	$scope.left = function () {
		// Left button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift X -;', true);
	};

	$scope.right = function () {
		// Right button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift X +;', true);
	};

	$scope.back = function () {
		// Back button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift Y +;', true);
	};

	$scope.forward = function () {
		// Forward button clicked, so submit the appropriate message to the cube,
		// and add it to the history
		$cubeAction.sendMessage('shift Y -;', true);
	};
});

// Controller for the 'Set' page
app.controller('SetCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage) {
	// Array for tracking each of the LEDs in the cube
	$scope.cube = [];

	$ionicPlatform.ready(function() {
		// Get the users last selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		// Get the colour that was selected while the modal window was shown
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.setLED = function (id) {
		// Called when the user clicks on one of the LEDs represented by the grid

		// Default to using black for an LED, unless the user has actually turned it on
		var colourToUse = "BLACK";
		if ($scope.cube[id] == true) {
			// LED was turned on, so get the selected colour
			colourToUse = $localstorage.get('selectedColour', '00d1ff');
		}

		// Build the message to send, translating the LEDs number into it's coordinates, and
		// then submit the message to the cube (adding it to the history)
		var message = "set " + $cubeAction.lookupCoords(id) + " " + colourToUse + ";";
		$cubeAction.sendMessage(message, true);
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		// Sets the selected colour to that of the favourite
		$localstorage.set('selectedColour', selectedColour);
		$scope.selectedColour = selectedColour;

		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Next' page
app.controller('NextCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage) {
	$ionicPlatform.ready(function() {
		// Get the users last selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		// Get the colour that was selected while the modal window was shown
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.next = function () {
		// Called when the user clicks the "Next" button

		// Get the colour that the user has selected
		var colourToUse = $localstorage.get('selectedColour', '00d1ff');

		// Build the message to send, then submit the message to the cube
		// (adding it to the history)
		var message = "next " + colourToUse + ";";
		$cubeAction.sendMessage(message, true);
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		// Sets the selected colour to that of the favourite
		$localstorage.set('selectedColour', selectedColour);
		$scope.selectedColour = selectedColour;

		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Set Plane' page
app.controller('SetPlaneCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage) {
	$ionicPlatform.ready(function() {
		// Set the default initial axis and offset
		$scope.values = {
			axis: 'X',
			offset: '0',
		};

		// Get the users last selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		// Get the colour that was selected while the modal window was shown
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.setPlane = function() {
		// Build the message to send, then submit the message to the cube (adding it to the history)
		var message = "setplane " + $scope.values.axis + " " + $scope.values.offset + " " + $scope.selectedColour + ";";
		$cubeAction.sendMessage(message, true);
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		// Sets the selected colour to that of the favourite
		$localstorage.set('selectedColour', selectedColour);
		$scope.selectedColour = selectedColour;

		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Copy Plane' page
app.controller('CopyPlaneCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage) {
	$ionicPlatform.ready(function() {
		// Set the default initial axis and start and destination offset
		$scope.values = {
			axis: 'X',
			fromOffset: '0',
			toOffset: '1',
		};
	});

	$scope.copyPlane = function() {
		// Build the message to send, then submit the message to the cube (adding it to the history)
		var message = "copyplane " + $scope.values.axis + " " + $scope.values.fromOffset + " " + $scope.values.toOffset + ";";
		$cubeAction.sendMessage(message, true);
	};
})

// Controller for the 'Move Plane' page
.controller('MovePlaneCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage) {
	$ionicPlatform.ready(function() {
		// Set the default initial axis and start and destination offset
		$scope.values = {
			axis: 'X',
			fromOffset: '0',
			toOffset: '1',
		};

		// Get the users last selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		// Get the colour that was selected while the modal window was shown
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.movePlane = function() {
		// Build the message to send, then submit the message to the cube (adding it to the history)
		var message = "moveplane " + $scope.values.axis + " " + $scope.values.fromOffset + " " + $scope.values.toOffset + " " + $scope.selectedColour + ";";
		$cubeAction.sendMessage(message, true);
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		// Sets the selected colour to that of the favourite
		$localstorage.set('selectedColour', selectedColour);
		$scope.selectedColour = selectedColour;

		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Line' page
app.controller('LineCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage, $cordovaDialogs) {
	// Array for tracking each of the LEDs in the cube
	$scope.cube = [];

	$ionicPlatform.ready(function() {
		// Get the users last selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		// Get the colour that was selected while the modal window was shown
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.drawLine = function() {
		// Called when the user wishes to draw a line between two points

		// Start to declare the message to send to the cube
		var message = "line ";

		// Counter for how many points the user selected
		var selected = 0;
		for (var i = 0; i <= 64; i++) {
			// Find the point(s) that the user selected
			if ($scope.cube[i] == true) {
				selected = selected + 1;

				// Add the coordinate of the point to the message to send to the cube
				message = message + $cubeAction.lookupCoords(i) + " ";
			}
		}

		if (selected == 2) {
			// Only 2 points were selected - so draw the line

			// Clear the selected points
			for (var i = 0; i <= 64; i++) {
				$scope.cube[i] = null;
			}

			// Finish the message for the cube by getting the selected colour, and sending it
			// to the cube (and add it to the history)
			message = message + $localstorage.get('selectedColour', '00d1ff') + ";";
			$cubeAction.sendMessage(message, true);
		} else {
			// More or less than 2 points were selected, so tell the user to only select 2
			$cordovaDialogs.alert('Please select only 2 points', 'Line', 'OK');
		}
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		// Sets the selected colour to that of the favourite
		$localstorage.set('selectedColour', selectedColour);
		$scope.selectedColour = selectedColour;

		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Box' page
app.controller('BoxCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage, $cordovaDialogs) {
	// Array for tracking each of the LEDs in the cube
	$scope.cube = [];

	// Track whether the user is trying to select the main colour, or the secondary colour used for some options
	var secondaryColourSelector = false;

	// Variable to store previous colour choices to work around having two colour pickers instead of just one
	var cachedColour = "";

	$ionicPlatform.ready(function() {
		// Set the default initial box style
		$scope.style = {
			boxStyle: '0',
		};

		// Get the users last selected colour, and the last "other" selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
		$scope.otherColour = $localstorage.get('otherColour', 'f80ed1');

		// Hide the button to pick the second colour by default
		$scope.showSecontaryColour = false;
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModalPrimary = function() {
		// Flag that we are picking the primary colour
		secondaryColourSelector = false;

		// Open the modal window
		$scope.modal.show()
	};

	$scope.openModalSecondary = function() {
		// Flag that we are picking the secondary colour
		secondaryColourSelector = true;

		// To work around the colour picker only setting the selectedColour, we cache
		// the primary selected colour, and then replace it with the previously saved
		// secondary colour
		cachedColour = $localstorage.get('selectedColour', '00d1ff');
		var otherColour = $localstorage.get('otherColour', 'f80ed1');
		$localstorage.set('selectedColour', otherColour);

		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		if (secondaryColourSelector) {
			// We picked the colour for the secondary colour, so handle resetting values

			// Get the colour that was selected while the modal window was shown
			$scope.otherColour = $localstorage.get('selectedColour', '00d1ff');

			// Reset the selectedColour to the previously cached version
			$localstorage.set('selectedColour', cachedColour);
			// Store the secondary colour for future reference
			$localstorage.set('otherColour', $scope.otherColour);
		} else {
			// Get the colour that was selected while the modal window was shown
			$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
		}
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.styleSelection = function() {
		// Called when the user changes the selected value in the style selector

		if (parseInt($scope.style.boxStyle) <= 2) {
			// Style 0, 1 and 2 (Solid, Walls or Edges only) only have a single colour,
			// so don't show the button for selecting the secondary colour
			$scope.showSecontaryColour = false;
		} else {
			// Style 3 and 4 (Walls or Edges filled) require two colours, so show the button
			// for selecting the secondary colour
			$scope.showSecontaryColour = true;
		}
	};

	$scope.drawBox = function() {
		// Called when the user wishes to draw a box between two points

		// Start to declare the message to send to the cube
		var message = "box ";

		// Counter for how many points the user selected
		var selected = 0;
		for (var i = 0; i <= 64; i++) {
			// Find the point(s) that the user selected
			if ($scope.cube[i] == true) {
				selected = selected + 1;

				// Add the coordinate of the point to the message to send to the cube
				message = message + $cubeAction.lookupCoords(i) + " ";
			}
		}

		if (selected == 2) {
			// Only 2 points were selected - so draw the box

			// Clear the selected points
			for (var i = 0; i <= 64; i++) {
				$scope.cube[i] = null;
			}

			// Add the primary colour, and selected style to the message to send to the cube
			message = message + $localstorage.get('selectedColour', '00d1ff') + " " + $scope.style.boxStyle;
			if (parseInt($scope.style.boxStyle) <= 2) {
				// End the message for the cube as it doesn't require any more info, and send it along
				// adding the message to the history
				message = message + ";";
				$cubeAction.sendMessage(message, true);
			} else {
				// Add the secondary colour as it is required, and send it along to the cube adding
				//the message to the history
				message = message + " " + $localstorage.get('otherColour', 'f80ed1') + ";";
				$cubeAction.sendMessage(message, true);
			}
		} else {
			// More or less than 2 points were selected, so tell the user to only select 2
			$cordovaDialogs.alert('Please select only 2 points', 'Box', 'OK');
		}
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		if (secondaryColourSelector) {
			// This was for the secondary colour, so save its value and pass it to the view
			$localstorage.set('otherColour', selectedColour);
			$scope.otherColour = selectedColour;
		} else {
			// This was for the primary colour, so save its value and pass it to the view
			$localstorage.set('selectedColour', selectedColour);
			$scope.selectedColour = selectedColour;
		}
		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Sphere' page
app.controller('SphereCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage, $cordovaDialogs) {
	// Array for tracking each of the LEDs in the cube
	$scope.cube = [];

	// Track whether the user is trying to select the main colour, or the secondary colour used for some options
	var secondaryColourSelector = false;

	// Variable to store previous colour choices to work around having two colour pickers instead of just one
	var cachedColour = "";

	$ionicPlatform.ready(function() {
		// Set the default initial sphere style and size
		$scope.style = {
			sphereStyle: '0',
			sphereSize: '3',
		};

		// Get the users last selected colour, and the last "other" selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
		$scope.otherColour = $localstorage.get('otherColour', 'f80ed1');

		// Hide the button to pick the second colour by default
		$scope.showSecontaryColour = false;
	});

	// Items for defining and handling the Colour Picker Modal
	$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModalPrimary = function() {
		// Flag that we are picking the primary colour
		secondaryColourSelector = false;

		// Open the modal window
		$scope.modal.show()
	};

	$scope.openModalSecondary = function() {
		// Flag that we are picking the secondary colour
		secondaryColourSelector = true;

		// To work around the colour picker only setting the selectedColour, we cache
		// the primary selected colour, and then replace it with the previously saved
		// secondary colour
		cachedColour = $localstorage.get('selectedColour', '00d1ff');
		var otherColour = $localstorage.get('otherColour', 'f80ed1');
		$localstorage.set('selectedColour', otherColour);

		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();

		if (secondaryColourSelector) {
			// We picked the colour for the secondary colour, so handle resetting values

			// Get the colour that was selected while the modal window was shown
			$scope.otherColour = $localstorage.get('selectedColour', '00d1ff');

			// Reset the selectedColour to the previously cached version
			$localstorage.set('selectedColour', cachedColour);
			// Store the secondary colour for future reference
			$localstorage.set('otherColour', $scope.otherColour);
		} else {
			// Get the colour that was selected while the modal window was shown
			$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
		}
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	$scope.styleSelection = function() {
		// Called when the user changes the selected value in the style selector

		if (parseInt($scope.style.sphereStyle) == 0) {
			// Style 0 (Walls Only) doesn't require a secondary colour so don't show the button
			$scope.showSecontaryColour = false;
		} else {
			// Style 1 (Solid) has a secondary colour so show the button
				$scope.showSecontaryColour = true;
		}
	};

	$scope.drawSphere = function() {
		// Called when the user wishes to draw a sphere starting from a given point

		// Start to declare the message to send to the cube
		var message = "sphere ";

		// Counter for how many points the user selected
		var selected = 0;
		for (var i = 0; i <= 64; i++) {
			// Find the point(s) that the user selected
			if ($scope.cube[i] == true) {
				selected = selected + 1;

				// Add the coordinate of the point to the message to send to the cube
				message = message + $cubeAction.lookupCoords(i) + " ";
			}
		}

		if (selected == 1) {
			// Only 1 point was selected - so draw the sphere

			// Clear the selected points
			for (var i = 0; i <= 64; i++) {
				$scope.cube[i] = null;
			}

			// Add the size and selected style to the message to send to the cube
			message = message + " " + $scope.style.sphereSize + " " + $localstorage.get('selectedColour', '00d1ff');
			if (parseInt($scope.style.sphereStyle) == 0) {
				// End the message for the cube as it doesn't require any more info, and send it along
				// adding the message to the history
				message = message + ";";
				$cubeAction.sendMessage(message, true);
			} else {
				// Add the secondary colour as it is required, and send it along to the cube adding
				//the message to the history
				message = message + " " + $localstorage.get('otherColour', 'f80ed1') + ";";
				$cubeAction.sendMessage(message, true);
			}
		} else {
			// More or less than 1 point were selected, so tell the user to only select 1
			$cordovaDialogs.alert('Please select only 1 point', 'Sphere', 'OK');
		}
	};

	$scope.chooseFavouriteColour = function(selectedColour) {
		// Called when the user picks one of the favourite colours from the colour picker modal

		if (secondaryColourSelector) {
			// This was for the secondary colour, so save its value and pass it to the view
			$localstorage.set('otherColour', selectedColour);
			$scope.otherColour = selectedColour;
		} else {
			// This was for the primary colour, so save its value and pass it to the view
			$localstorage.set('selectedColour', selectedColour);
			$scope.selectedColour = selectedColour;
		}
		// Close the modal window
		$scope.closeModal();
	};
});

// Controller for the 'Connect' page
app.controller('ConnectCtrl', function($ionicPlatform, $scope, $cordovaBluetoothSerial, $ionicLoading, $localstorage, $ionicSideMenuDelegate, $translate) {
	// Show the connect button, and hide the disconnect button by default
	$scope.connectButton = true;
	$scope.disconnectButton = false;

	// Hide the log text
	$scope.hideLogText = true;

	// Determine what state the user last had the auto connect toggle set to, and reset
	// it to that state
	if ($localstorage.get('autoConnect') == "true") {
		$scope.autoConnect = true;
	} else {
		$scope.autoConnect = false;
	}

	$ionicPlatform.ready(function() {
		if (typeof navigator.globalization !== "undefined") {
			// Get the preferred language of the users device
			navigator.globalization.getPreferredLanguage(function(language) {
				// Tell the translation frame work to use the users language
				$translate.use(language.value).then(function(data) {
				}, function(error) {
				});
			}, null);
		}
	});

	// Function called just before this view is shown
	$scope.$on('$ionicView.beforeEnter', function() {
		// Check whether or not we are connected to the cube
		$scope.checkConnected();
	});

	// Function called just after a view is shown
	$scope.$on('$ionicView.afterEnter', function() {
		if ($scope.autoConnect == true) {
			// User wishes to attempt to auto connect, so check current connection status
			$cordovaBluetoothSerial.isConnected().then(
				function() {
					// Connected, so no action required
				},
				function() {
					// Not connected. Attempt to connect
					$scope.connect();
				}
			);
		}
	});

	// Functions for showing and hiding the loading overlay
	$scope.showConnectionOverlay = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner><br>Connecting to BlueCube'
		});
	};

	$scope.hideConnectionOverlay = function() {
		$ionicLoading.hide();
	};

	$scope.autoConnectChanged = function() {
		// Called every time the auto connect toggle is changed

		if ($scope.autoConnect == false) {
			// Auto Connect was previously set to false

			// Enable Auto Connect, and save the users choice
			$scope.autoConnect = true;
			$localstorage.set('autoConnect', 'true');

			// Attempt to connect to the cube, if not already connected
			$cordovaBluetoothSerial.isConnected().then(
				function() {
					// Connected, so no action required
				},
				function() {
					// Not connected. Attempt to connect
					$scope.connect();
				}
			);
		} else {
			// Auto Connect was previously set to true

			// Disable Auto Connect, and save the users choice
			$scope.autoConnect = false;
			$localstorage.set('autoConnect', 'false');
		}
	};

	// Function to Connect to the BlueCube
	$scope.connect = function() {
		// Show the progress overlay
		$scope.showConnectionOverlay();

		// Unhide the log text
		$scope.hideLogText = false;

		// Check if Bluetooth is enabled
		$scope.logText = "Starting Connection Procedures<br>";
		$cordovaBluetoothSerial.isEnabled().then(
			function() {
				// Bluetooth is enabled, so inform the user
				$scope.logText = $scope.logText + "Bluetooth is enabled...<br>";

				// Find possible devices to connect to
				$scope.logText = $scope.logText + "Searching for Bluetooth Devices<br>";
				var bluetoothDeviceID = null; // Tracker for the device to connect to

				$cordovaBluetoothSerial.list().then(
					function(peripherals) {
						// Search for devices is complete
						if (peripherals.length > 0) {
							// Items found, so list Bluetooth Devices (that the library knows about)
							$scope.logText = $scope.logText + JSON.stringify(peripherals) + "<br>";

							// Get the first device that we find's ID.
							bluetoothDeviceID = peripherals[0].id;

							// Connect to the device
							$cordovaBluetoothSerial.connect(bluetoothDeviceID).then(
								function() {
									// Successfully connected to cube
									$scope.logText = "BlueCube (" + bluetoothDeviceID + ") is Connected<br>";

									// Save the ID of the cube we connected to
									$localstorage.set('bluetoothUUID', bluetoothDeviceID);

									// Disable the connect button, and enable the disconnect button
									$scope.connectButton = false;
									$scope.disconnectButton = true;

									// Hide the progress overlay
									$scope.hideConnectionOverlay();

									// Open the side menu so that the user can choose where they want to go
									$ionicSideMenuDelegate.toggleLeft();
								},
								function() {
									// Failed to connect
									$scope.logText = "ERROR: Failed to connect to BlueCube (" + bluetoothDeviceID + ")<br>";

									// Enable the connect button so the user can try again,
									// and disable the disconnect button
									$scope.connectButton = true;
									$scope.disconnectButton = false;

									// Hide the progress overlay
									$scope.hideConnectionOverlay();
								}
							);
						} else {
							// No devices found
							$scope.logText = "Error: No BlueCube found to connect to<br>";

							// Enable the connect button so the user can try again,
							// and disable the disconnect button
							$scope.connectButton = true;
							$scope.disconnectButton = false;

							// Hide the progress overlay
							$scope.hideConnectionOverlay();
						}
					},
					function(reason) {
						// Error finding Bluetooth devices.
						$scope.logText = "ERROR: Listing Bluetooth Devices Failed: " + reason + "<br>";

						// Enable the connect button so the user can try again,
						// and disable the disconnect button
						$scope.connectButton = true;
						$scope.disconnectButton = false;

						// Hide the progress overlay
						$scope.hideConnectionOverlay();
					}
				);
			},
			function() {
				// Bluetooth is not enabled
				$scope.logText = "ERROR: Bluetooth is *NOT* enabled. Please enable it and try again.<br>";

				// Enable the connect button so the user can try again,
				// and disable the disconnect button
				$scope.connecyButton = false;
				$scope.disconnectButton = false;

				// Hide the progress overlay
				$scope.hideConnectionOverlay();
			}
		);
	};

	// Function to Disconnect from the BlueCube
	$scope.disconnect = function() {
		$cordovaBluetoothSerial.disconnect().then(
			function() {
				// Disconnect was sucessfull
				$scope.logText = "Disconnected from BlueCube (" + $localstorage.get('bluetoothUUID') + ")<br>";

				// Enable the connect button, and hide the disconnect button
				$scope.connectButton = true;
				$scope.disconnectButton = false;
			},
			function(error) {
				// Couldn't disconnect
				$scope.logText = "ERROR: Failed to disconnect: " + error + "<br>";

				// Leave the disconnect button visable
				$scope.disconnectButton = true;
			}
		);
	};

	// Function to setup the state of the view based on our connection status
	$scope.checkConnected = function() {
		// Check current connection status
		$cordovaBluetoothSerial.isConnected().then(
			function() {
				// Connected
				$scope.logText = "BlueCube (" + $localstorage.get('bluetoothUUID') + ") is Connected<br>";

				// Show disconnect button, and hide connect button
				$scope.disconnectButton = true;
				$scope.connectButton = false;
			},
			function() {
				// Disconnected
				$scope.logText = "Not connected to a BlueCube<br>";

				// Show connect button, and hide disconnect button
				$scope.connectButton = true;
				$scope.disconnectButton = false;
			}
		);
	};
});

// Controller for the 'User Defined Functions' page
app.controller('UserDefinedCtrl', function($ionicPlatform, $scope, $cubeAction, $ionicModal, $localstorage, $cordovaDialogs, UserDefinedService) {
	// Don't show the delete or reordering buttons on the list items by default
	$scope.data = {
		showDelete: false,
		showReordering: false,
	};

	$scope.$on('$ionicView.beforeEnter', function() {
		// Get the list of previously defined user defined functions
		$scope.userDefinedFunctions = UserDefinedService.list();

		// Get the previously selected colour
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
	});

	$ionicPlatform.ready(function() {
		// Get the list of previously defined user defined functions
		$scope.userDefinedFunctions = UserDefinedService.list();

		// Create placeholder variables for items that will come from a modal window
		$scope.userDefinedFuntionData =	{
											name: '',
											number: '',
											colourRequired: false,
											colour: '',
										};
	});

	// Items for defining and handling the User Defined Functions Modal
	$ionicModal.fromTemplateUrl('templates/userDefinedModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	// Execute action when the modal is hidden (closed)
	$scope.$on('modal.hidden', function() {
		// Clear any values the client set in the modal window
		$scope.userDefinedFuntionData =	{
											name: '',
											number: '',
											colourRequired: false,
											colour: '',
										};
	});

	$scope.saveUserDefinedFunction = function() {
		// Run from the modal whenever the user wishes to save a new user defined function

		if ($scope.userDefinedFuntionData.name == "") {
			// A name wasn't provided but is required. Prompt the user for one.
			$cordovaDialogs.alert('Please provide a name', 'Error', 'OK');
			return false;
		}
		if (isNaN(parseInt($scope.userDefinedFuntionData.number))) {
			// User defined functions are identified by a number. One was either not provided,
			// or what was provided is not a number. Prompt the user for a valid number
			$cordovaDialogs.alert('Please provide a number that matches the user defined function in the Arduino sketch', 'Error', 'OK');
			return false;
		}

		// Save the item, after retrieving the previously selected colour.
		$scope.userDefinedFuntionData.colour = $localstorage.get('selectedColour', '00d1ff');
		UserDefinedService.add($scope.userDefinedFuntionData);

		// Hide the modal
		$scope.modal.hide();
	};

	$scope.deleteUserDefinedFunction = function (id) {
		// Delete the selected user defined function
		UserDefinedService.delete(id);
	};

	$scope.reorderUserDefinedFunction = function(item, fromIndex, toIndex) {
		// Reorder how the user defined functions are displayed
		UserDefinedService.reorder(item, fromIndex, toIndex);
	};

	$scope.sendUserDefinedFunction = function (id) {
		// Run when the user selected a user defined function

		// Lookup the details for the user defined function
		$udf = UserDefinedService.get(id);

		// Start to build the message to send to the cube
		var message = "user " + $udf.number;
		if ($udf.colourRequired == true) {
			// Add the colour that was selected if required
			message = message + " " + $udf.colour;
		}

		// Finish the message and send it to the cube, adding it to the history
		message = message + ";";
		$cubeAction.sendMessage(message, true);
	};
});

// Controller for the 'Static Favourites' page
app.controller('StaticCtrl', function($ionicPlatform, $scope, $timeout, $cubeAction, $ionicModal, $localstorage, $cordovaDialogs, StaticFavouritesService) {
	// Don't show the delete or reordering buttons on the list items by default
	$scope.data = {
		showDelete: false,
		showReordering: false,
	};

	// Array for the individual commands that make up static favourite
	$scope.staticCommands = [];

	$scope.$on('$ionicView.beforeEnter', function() {
		// Get the list of previously defined static favourites
		$scope.favourites = StaticFavouritesService.list();
	});

	$ionicPlatform.ready(function() {
		// Get the list of previously defined static favourites
		$scope.favourites = StaticFavouritesService.list();

		// Create placeholder variables for items that will come from a modal window
		$scope.staticCommandsData =	{
										name: '',
										cmds: [],
									};
	});

	// Items for defining and handling the Static Favourites Creator Modal
	$ionicModal.fromTemplateUrl('templates/staticCreator.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.openModal = function() {
		// Open the modal window
		$scope.modal.show()
	};

	$scope.closeModal = function() {
		// Close the modal window
		$scope.modal.hide();
	};

	$scope.$on('$destroy', function() {
		// Remove the modal from the scope, avoiding a memory leak
		$scope.modal.remove();
	});

	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Clear any values the client set in the modal window
		$scope.staticCommands = [];
		$scope.staticCommandsData =	{
										name: '',
										cmds: [],
									};
	});

	$scope.saveFavourite = function() {
		// Called from the modal when the user wishes to save a static favourite

		if ($scope.staticCommandsData.name == "") {
			// A name wasn't provided but is required, so ask the user for it
			$cordovaDialogs.alert('Please provide a name', 'Error', 'OK');
		} else {
			if ($scope.staticCommandsData.cmds.length == 0) {
				// The user didn't select any commands to include in the favourite, so
				// prompt them to add at least a single command
				$cordovaDialogs.alert('Please select at least 1 item', 'Error', 'OK');
			} else {
				// Save the items the user selected
				StaticFavouritesService.add($scope.staticCommandsData.name, $scope.staticCommandsData.cmds);

				// Close the modal window
				$scope.modal.hide();
			}
		}
	};

	$scope.deleteFavourite = function (id) {
		// Delete the selected static favourite
		StaticFavouritesService.delete(id);
	};

	$scope.reorderFavourites = function(item, fromIndex, toIndex) {
		// Reorder how the static favourites are displayed
		StaticFavouritesService.reorder(item, fromIndex, toIndex);
	};

	$scope.sendFavourite = function (id) {
		// Run when the user selects a static favourite to send to the cube

		// Get the details of the static favourite that the use selected
		var $cmds = StaticFavouritesService.get(id);

		for (var i = 0; i < $cmds.length; i++) {
			// Get the commands that make up the static favourite
			cmdToSend = $cmds[i].cmd;

			// To work in the loop, I needed to wrap the timeout call in a closure function,
			// and pass the values into it. If I didn't do this, it would only use the last
			// value for all calls.
			(function(cmdToSend, i) {
				$timeout(function() {
					// Send each command that is part of the static favourite to the cube.
					// This is wrapped in a timeout with an increasing but tiny delay before
					// its run to stop the bluetooth stack and the cube from getting swamped
					// and not being able to transmit and process all of the commands
					$cubeAction.sendMessage(cmdToSend, true);
				}, i);
			})(cmdToSend, i);
		}
	};
});

// Controller for the 'History' page
app.controller('HistoryCtrl', function($ionicPlatform, $scope, $cubeAction, HistoryService, $localstorage) {
	// Don't show the delete button on the list items by default
	$scope.data = {
		showDelete: false,
	};

	$scope.$on('$ionicView.beforeEnter', function() {
		// Get the list of previously transmitted commands
		$scope.commands = HistoryService.list();
	});

	$ionicPlatform.ready(function() {
		// Get the list of previously transmitted commands
		$scope.commands = HistoryService.list();
	});

	$scope.replayHistoryItem = function(command) {
		// When the user selects a item from the list, resend it to the command,
		// but don't add it to the history
		$cubeAction.sendMessage(command, false);
	};

	$scope.deleteHistoryItem = function (id) {
		// Delete the selected item from the history
		HistoryService.delete(id);
	};
});

// Controller for the 'Settings' page
app.controller('SettingsCtrl', function($scope, $defaults, $localstorage, $cordovaDialogs) {
	// Track what the maximum number of items we should keep in the history is
	var maxHistoryItems;

	if ($localstorage.get('history_items') != undefined) {
		// Get the previously saved setting for the number of history items
		maxHistoryItems = parseInt($localstorage.get('history_items'));
	} else {
		// No value has been set, so default to storing 100 history items
		maxHistoryItems = 100;
	}

	// Provide the value for the maximum number of history items to the view
	$scope.data =	{
						'maxHistoryItems': maxHistoryItems
					};

	$scope.setMaxHistoryItems = function(number) {
		// When the user changes the slider for the number of history items, save it
		$localstorage.set('history_items', number);
	};

	$scope.resetColours = function () {
		// Run when the user wishes to reset the colours

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to reset to the default values?', 'Reset', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {
				// User clicked 'OK', so reset the colours
				$defaults.resetColours();
			}
		});
	};

	$scope.resetUserDefinedFunctions = function () {
		// Run when the user wishes to reset the list of user defined functions

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to reset to the default values?', 'Reset', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {

				// User clicked 'OK', so reset the user defined functions
				$defaults.resetUserDefinedFunctions();
			}
		});
	};

	$scope.resetStatic = function () {
		// Run when the user wishes to reset the list of static favourites

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to reset to the default values?', 'Reset', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {

				// User clicked 'OK', so reset the static favourites
				$defaults.resetStatic();
			}
		});
	};

	$scope.resetHistory = function () {
		// Run when the user wishes to reset the history

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to clear the history?', 'Reset', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {

				// User clicked 'OK', so clear the history
				$defaults.resetHistory();
			}
		});
	};

	$scope.resetOthers = function() {
		// Run when the user wishes to reset background settings (items like auto connect)

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to reset background settings?', 'Reset', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {

				// User clicked 'OK', so reset the background values
				$defaults.resetOthers();
			}
		});
	};

	$scope.resetAll = function () {
		// Run when the user wishes to reset everything

		// Confirm that they want to reset
		$cordovaDialogs.confirm('Are you sure you want to reset all settings?', 'Reset All', ['Cancel','OK']).then(function(buttonIndex) {
			if (buttonIndex == 2) {

				// User clicked 'OK', so reset everything
				$defaults.resetColours();
				$defaults.resetUserDefinedFunctions();
				$defaults.resetStatic();
				$defaults.resetHistory();
				$defaults.resetOthers();
			}
		});
	};
});

// Controller for the 'About' page
app.controller('AboutCtrl', function($ionicPlatform, $scope, $cordovaDevice, $cordovaAppVersion) {
	$ionicPlatform.ready(function() {
		// Get information about the device
		var device = $cordovaDevice.getDevice();
		$scope.manufacturer = device.manufacturer;
		$scope.model = device.model;
		$scope.platform = device.platform;
		$scope.version = device.version;
		$scope.uuid = device.uuid;

		// Get the apps version and build number
		$cordovaAppVersion.getVersionNumber().then(function (version) {
			$scope.appVersion = version;
		}, false);
		$cordovaAppVersion.getVersionCode().then(function (build) {
			$scope.appBuild = build;
		}, false);

		// Get the preferred language of the device
		if (typeof navigator.globalization !== "undefined") {
			navigator.globalization.getPreferredLanguage(function(language) {
				$scope.language = language.value;
			}, null);
		}
	});
});

// Controller for the 'Colour Picker' modal
app.controller('ColourPickerCtrl', function($ionicPlatform, $scope, ColourService, $localstorage) {
	// Don't show the delete or reordering buttons on the list items by default
	$scope.data = {
		showDelete: false,
		showReordering: false,
	};

	$ionicPlatform.ready(function() {
		// Get the initial colour to set the colour selector to
		var initialColour = $localstorage.get('selectedColour', '00d1ff');

		// Make the colour available to the view
		$scope.hexColour = initialColour;

		// Set the colour selector to the initial colour
		initialColour = '#' + initialColour;
		$scope.colour = {targetColor: initialColour};

		// Make the list of colour favourites available to the view
		$scope.colours = ColourService.list();

		// What for when the user selects a new colour via the colour picker
		$scope.$watchCollection('colour.targetColor', function(newValue, oldValue) {
			if (newValue != oldValue) {
				// The colour has changed so track it

				// The colour is returned as #XXXXXX whereas we don't required the #,
				// so get only the hex part of the colour string
				$scope.hexColour = newValue.substring(1);

				// Save the choice for future reference
				$localstorage.set('selectedColour', $scope.hexColour);
			}
		});
	});

	$scope.addUserColour = function () {
		// Save the currently selected colour to the favourites list
		ColourService.add($scope.hexColour);
	};

	$scope.deleteUserColour = function (id) {
		// Delete the colour favourite with the provided id.
		ColourService.delete(id);
	};

	$scope.reorderItem = function(item, fromIndex, toIndex) {
		// Reorder the favourite colours list
		ColourService.reorder(item, fromIndex, toIndex);
	};
});

app.controller('UserDefinedModalCtrl', function($ionicPlatform, $scope, $ionicModal, $localstorage) {
	$scope.dataModal = {
		showDelete: false,
		showReordering: false,
	};

	$ionicPlatform.ready(function() {
		$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');

		$ionicModal.fromTemplateUrl('templates/colourPicker.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal
		});

		$scope.openModal = function() {
			$scope.modal.show()
		};

		$scope.chooseFavouriteColour = function(selectedColour) {
			$localstorage.set('selectedColour', selectedColour);
			$scope.selectedColour = selectedColour;
			$scope.closeModal();
		};

		$scope.closeModal = function() {
			$scope.modal.hide();
			$scope.selectedColour = $localstorage.get('selectedColour', '00d1ff');
		};

		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
	});
});

app.controller('StaticCreatorCtrl', function($ionicPlatform, $scope, HistoryService, $localstorage) {
	var uniqueID = 1;


	$scope.dataModal = {
		showDelete: false,
		showReordering: false,
	};

	$ionicPlatform.ready(function() {
		$scope.commands = HistoryService.list();
	});

	$scope.showSaveButton = function () {
		if ($scope.staticCommands.length >= 1) {
			$scope.saveButton = true;
		} else {
			$scope.saveButton = false;
		}
	};

	$scope.addStaticCommand = function (command) {
	var item =	{
					id: uniqueID,
					cmd: command,
				};

		uniqueID = uniqueID + 1;
		$scope.staticCommands.push(item);
		$scope.staticCommandsData.cmds = $scope.staticCommands;
		$scope.showSaveButton();
	};

	$scope.deleteStaticCommand = function (id) {
		for (i in $scope.staticCommands) {
			if ($scope.staticCommands[i].id == id) {
				$scope.staticCommands.splice(i, 1);
			}
		}
		$scope.staticCommandsData.cmds = $scope.staticCommands;
		$scope.showSaveButton();
	};

	$scope.reorderStaticCommands = function(item, fromIndex, toIndex) {
		$scope.staticCommands.splice(fromIndex, 1);
		$scope.staticCommands.splice(toIndex, 0, item);
		$scope.staticCommandsData.cmds = $scope.staticCommands;
	};
});
