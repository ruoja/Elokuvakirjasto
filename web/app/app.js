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

    this.getMovie = function (key, done) {
        movies.$loaded(function () {
            done(movies.$getRecord(key));
        });
    };

    this.editMovie = function (movie) {
        movies.$save(movie);
    };

    this.removeMovie = function (movie) {
        movies.$remove(movie);
    };
});

MovieApp.service('APIService', function ($http) {
    var url = 'http://www.omdbapi.com';
    this.findMovie = function (name, year) {
        return $http.get(url, {params: {s: name, y: year}});
    };
});

MovieApp.service('AuthenticationService', function ($firebase, $firebaseAuth) {
    var firebaseRef = new Firebase('https://sweltering-fire-6863.firebaseio.com/movies');
    var firebaseAuth = $firebaseAuth(firebaseRef);

    this.logUserIn = function (email, password) {
        return firebaseAuth.$authWithPassword({
            email: email,
            password: password
        });
    };

    this.createUser = function (email, password) {
        return firebaseAuth.$createUser({
            email: email,
            password: password
        });
    };

    this.checkLoggedIn = function () {
        return firebaseAuth.$waitForAuth();
    };

    this.logUserOut = function () {
        firebaseAuth.$unauth();
    };

    this.getUserLoggedIn = function () {
        return firebaseAuth.$getAuth();
    };
});

MovieApp.config(function ($routeProvider) {
    $routeProvider
            .when('/', {
                controller: 'UserController',
                templateUrl: 'login.html'
            })
            .when('/register', {
                controller: 'UserController',
                templateUrl: 'register.html'
            })
            .when('/movies', {
                controller: 'ListController',
                templateUrl: 'movies.html'
            })
            .when('/movies/new', {
                controller: 'AddController',
                templateUrl: 'new.html',
                resolve: {
                    currentAuth: function (AuthenticationService) {
                        return AuthenticationService.checkLoggedIn();
                    }
                }
            })
            .when('/movies/:id', {
                controller: 'ShowController',
                templateUrl: 'show.html'
            })
            .when('/movies/:id/edit', {
                controller: 'EditController',
                templateUrl: 'edit.html',
                resolve: {
                    currentAuth: function (AuthenticationService) {
                        return AuthenticationService.checkLoggedIn();
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });
});

MovieApp.config(['$httpProvider', function ($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }]);

MovieApp.controller('ListController', function ($scope, FirebaseService, APIService, AuthenticationService) {
    $scope.movies = FirebaseService.getMovies();
    $scope.getMovies = function () {
        $scope.movies = FirebaseService.getMovies();
        delete $scope.movies.omdb;
    };
    $scope.removeMovie = function (movie) {
        FirebaseService.removeMovie(movie);
    };
    $scope.findMovie = function (name, year) {
        $scope.movies.omdb = true;
        APIService.findMovie(name, year).success(function (movies) {
            if (movies.Response == 'False') {
                $scope.omdbmovies.Search.length = 0;
            } else {
                $scope.omdbmovies = movies;
            }
        });
        $scope.searchtext = '';
        $scope.searchyear = '';
    };
    $scope.logged = AuthenticationService.getUserLoggedIn();
});

MovieApp.controller('AddController', function ($scope, FirebaseService, $location, currentAuth) {
    if (!currentAuth) {
        $location.path('/login');
    }
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

MovieApp.controller('ShowController', function ($scope, $routeParams, FirebaseService) {
    FirebaseService.getMovie($routeParams.id, function (movie) {
        $scope.movie = movie;
    });
});

MovieApp.controller('EditController', function ($scope, $routeParams, FirebaseService, $location, currentAuth) {
    if (!currentAuth) {
        $location.path('/login');
    }
    FirebaseService.getMovie($routeParams.id, function (movie) {
        $scope.movie = movie;
        $scope.editName = movie.name;
        $scope.editDirector = movie.director;
        $scope.editYear = movie.year;
        $scope.editDescription = movie.description;
    });


    $scope.editMovie = function (movie) {
        if ($scope.editName !== '' && $scope.editDirector !== '' && $scope.editYear !== '' && $scope.editDescription !== '') {
            movie.name = $scope.editName;
            movie.director = $scope.editDirector;
            movie.year = $scope.editYear;
            movie.description = $scope.editDescription;
            FirebaseService.editMovie(movie);
            $location.path('#/movies/' + $routeParams.id);
        }
    };
});

MovieApp.controller('UserController', function ($scope, $location, AuthenticationService) {

    $scope.logIn = function () {
        AuthenticationService.logUserIn($scope.email, $scope.password)
                .then(function () {
                    $location.path('/movies');
                })
                .catch(function () {
                    $scope.message = 'Väärä sähköpostiosoite tai salasana!';
                });
    };

    $scope.register = function () {
        AuthenticationService.createUser($scope.newEmail, $scope.newPassword)
                .then(function () {
                    AuthenticationService.logUserIn($scope.newEmail, $scope.newPassword)
                            .then(function () {
                                $location.path('/movies');
                            });
                })
                .catch(function () {
                    $scope.message = 'Tapahtui virhe! Yritä uudestaan';
                });
    };
});

MovieApp.run(function (AuthenticationService, $rootScope, $location) {
    $rootScope.logOut = function () {
        AuthenticationService.logUserOut();
        $location.path('/login');
    };
    $rootScope.userLoggedIn = function () {
      return AuthenticationService.getUserLoggedIn();
    };
});