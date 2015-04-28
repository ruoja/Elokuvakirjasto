var MovieApp = angular.module('MovieApp', ['firebase']);

MovieApp.service('FirebaseService', function ($firebase) {
    var firebaseRef = new Firebase('https://sweltering-fire-6863.firebaseio.com/movies');
    var sync = $firebase(firebaseRef);
    var movies = sync.$asArray();

    this.getMovies = function () {
        return movies;
    };

    this.addMovie = function (movie) {
        movies.$add(movie);
    };
});

MovieApp.controller('ListController', function ($scope, FirebaseService) {
    $scope.movies = FirebaseService.getMovies();
});

MovieApp.controller('AddController', function ($scope, FirebaseService) {
    $scope.addMovie = function(movie) {
        FirebaseService.addMovie({
            name: $scope.name,
            director: $scope.director,
            year: $scope.year,
            description: $scope.description
        });
    };
});