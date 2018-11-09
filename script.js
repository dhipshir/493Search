//Fall 2018 EECS 493 Artist Search Engine
//Author: Daniel E. Hipshire Jr.
//Using iTunes and Wikipedia APIs

var app = angular.module('493Search', []);

app.controller('searchResult',[ '$scope', '$http', function($scope, $http) {
  $scope.input = {
    text: ''
  };

  $scope.needsLoad = new Array(50);
  for (i = 0; i < 50; i++) {
    $scope.needsLoad[i] = true;
  }

  $scope.searchResults = {};
  $scope.numGenresSelected = 1;
  
  //executed whenever a user searches an artist
  $scope.getInfo = function(keyEvent) {
    if (keyEvent.which === 13) {
      //making the user input iTunes API-friendly
      $scope.input.text.trim();
      $scope.input.text.replace(/ /g, '+');
      var itunesURL = 'https://itunes.apple.com/search?term=' + $scope.input.text;
      $scope.genreButtons = {
        'ALL': { selected: true 
        }
      };
      //making the call to iTunes API
      $http({
        method: 'GET',
        url: itunesURL
      }).then(function successCallback(response) {
        $scope.searchResults = response.data.results;
        console.log(response.data);
        //loop through results and store each unique genre name
        angular.forEach($scope.searchResults, function(value, key) {
          if (!$scope.genreButtons.hasOwnProperty(value.primaryGenreName)) {
            $scope.genreButtons[value.primaryGenreName] = {selected: false};           
          }
        },);
        console.log($scope.genreButtons);
        }, function errorCallback(response) {
          console.log("Error with the iTunes API call.");
      });
    }
  }
  
  //executed whenever a user clicks the Artist Info tab on a result
  $scope.getArtistInfo = function(index, name) {
    //calling the Wiki API for artist info, only if we haven't already for this result
    if (!$scope.searchResults[index].hasOwnProperty('artistWikiInfo')) {
      var urlName = name.trim();
      urlName = urlName.replace(/ /g, '%20');
      
      $http.jsonp('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + urlName +
      '&format=json&callback=JSON_CALLBACK').then(function mySuccess(response) {
      console.log(response.data);
      if (response.data.query.search.length == 0) {
        var resultInfo = "Sorry, there is no information for this artist!";
      }
      else {
        var wikiResult = response.data.query.search[0].snippet;
        //need to strip the result string since it contains html code
        var resultInfo = wikiResult.replace(/(<([^>]+)>)/ig,"");
      }
      //store the info result so we don't need to call the API again for this result
      $scope.needsLoad[index] = false;
      $scope.searchResults[index].artistWikiInfo = resultInfo;
    }, function myError(response) {
      console.log("Error with the Wikipedia API call.");
    });
    //else we've already called the Wiki API for this result and have it stored and ready to display
    }
    else {
      return;
    }

  }

  //executed whenever a user clicks on one of the genre filter buttons
  $scope.updateFilter = function(genre, wasSelected) {
    if (genre == "ALL") {
      //if a user toggles 'ALL' we only want the 'ALL' button highlighted
      angular.forEach($scope.genreButtons, function(value, key) {
        if (key !== "ALL") {
          $scope.genreButtons[key].selected = false;
        }  
        $scope.genreButtons['ALL'].selected = true;
      },);
      $scope.numGenresSelected = 1;
      return;
    }
    //invert the genre's selected value
    $scope.genreButtons[genre].selected = !$scope.genreButtons[genre].selected;
    //update the counter
    if (wasSelected) {
      $scope.numGenresSelected = $scope.numGenresSelected - 1;
    }else{
      $scope.numGenresSelected = $scope.numGenresSelected + 1;
    }
    //toggle 'ALL' off when a user selects another genre
    if ($scope.numGenresSelected > 1 && $scope.genreButtons['ALL'].selected) {
      $scope.genreButtons['ALL'].selected = false;
      $scope.numGenresSelected--;
    }
  }
  
}]);
