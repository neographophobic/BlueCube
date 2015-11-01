angular.module('BlueCube.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('DeviceCtrl', function($ionicPlatform, $scope, $cordovaDevice) {
    $ionicPlatform.ready(function() {
        $scope.$apply(function() {
            // sometimes binding does not work! :/
 
            // getting device infor from $cordovaDevice
            var device = $cordovaDevice.getDevice();
 
            $scope.manufacturer = device.manufacturer;
            $scope.model = device.model;
            $scope.platform = device.platform;
            $scope.version = device.version;
            $scope.uuid = device.uuid;
 
        });
 
    });
})

.controller('TestCtrl', function($ionicPlatform, $scope, $cordovaBluetoothSerial) {
    $ionicPlatform.ready(function() {
    	
		$scope.logText = "Starting Bluetooth Test<br>";
		$cordovaBluetoothSerial.isEnabled().then(
			function() {
				$scope.logText = $scope.logText + "Bluetooth is enabled<br>";

				$scope.logText = $scope.logText + "List Bluetooth Devices<br>";
				// List found Bluetooth Devices (that the library knows about)
				var bluetoothDeviceID = null;
				$cordovaBluetoothSerial.list().then(
					function(peripherals) {
						$scope.logText = $scope.logText + JSON.stringify(peripherals) + "<br>";
						bluetoothDeviceID = peripherals[0].id;
					},
					function(reason) {
						$scope.logText = $scope.logText + "Listing Bluetooth Devices Failed: " + reason + "<br>";
					}
				);		

			},
			function() {
				$scope.logText = $scope.logText + "Bluetooth is *NOT* enabled<br>";
			}
		);		
    });
});

