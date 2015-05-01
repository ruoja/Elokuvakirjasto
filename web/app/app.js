var MovieApp = angular.module('MovieApp', ['firebase', 'ngRoute']);

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

MovieApp.config(function ($routeProvider) {
    $routeProvider
            .when('/', {
                controller: 'ListController',
                templateUrl: 'movies.html'
            })
            .when('/movies', {
                controller: 'ListController',
                templateUrl: 'movies.html'
            })
            .when('/movies/new', {
                controller: 'AddController',
                templateUrl: 'new.html'
            })
            .otherwise({
                redirectTo: '/'
            });
});

MovieApp.controller('ListController', function ($scope, FirebaseService) {
    $scope.movies = FirebaseService.getMovies();
    $scope.getMovies = function() {
        FirebaseService.getMovies();
    };
});

MovieApp.controller('AddController', function ($scope, FirebaseService, $location) {
    $scope.movies = FirebaseService.getMovies();
    $scope.addMovie = function (movie) {
        if ($scope.name !== '' && $scope.director !== '' && $scope.year !== '' && $scope.description !== '') {
            FirebaseService.addMovie({
                name: $scope.name,
                director: $scope.director,
                year: $scope.year,
                description: $scope.description
            });
            $location.path('/movies');
        }
    };
});