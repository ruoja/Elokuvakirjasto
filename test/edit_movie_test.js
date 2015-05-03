describe('Edit movie', function () {
    var controller, scope;

    var FirebaseServiceMock, RouteParamsMock;

    beforeEach(function () {
        module('MovieApp');

        FirebaseServiceMock = (function () {
            return {
                editMovie: function (movie) {
                    movie.name = scope.editName;
                    movie.director = scope.editDirector;
                    movie.year = scope.editYear;
                    movie.description = scope.editDescription;
                    //FirebaseServiceMock.editMovie(movie);
                },
                getMovie: function (key, done) {
                    if (key == 'abc123') {
                        done({
                            name: 'Joku leffa',
                            director: 'Kalle Ilves',
                            year: 2015,
                            description: 'Mahtava leffa!'
                        });
                    } else {
                        done(null);
                    }
                }
            };
        })();

        RouteParamsMock = (function () {
            return {
                id: 'abc123'
            };
        })();

        // Lisää vakoilijat
        spyOn(FirebaseServiceMock, 'editMovie').and.callThrough();

        // Injektoi toteuttamasi kontrolleri tähän
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('EditController', {
                $scope: scope,
                FirebaseService: FirebaseServiceMock,
                $routeParams: RouteParamsMock
            });
        });

        FirebaseServiceMock.getMovie(RouteParamsMock.id, function (movie) {
            scope.movie = movie;
            scope.editName = movie.name;
            scope.editDirector = movie.director;
            scope.editYear = movie.year;
            scope.editDescription = movie.description;
        });
    });

    /*
     * Testaa alla esitettyjä toimintoja kontrollerissasi
     */

    /*
     * Testaa, että muokkauslomakkeen tiedot täytetään muokattavan elokuvan tiedoilla.
     * Testaa myös, että Firebasea käyttävästä palvelusta kutsutaan oikeaa funktiota,
     * käyttämällä toBeCalled-oletusta.
     */
    it('should fill the edit form with the current information about the movie', function () {
        expect(scope.editName).toBe('Joku leffa');
        expect(scope.editDirector).toBe('Kalle Ilves');
        expect(scope.editYear).toBe(2015);
        expect(scope.editDescription).toBe('Mahtava leffa!');
    });

    /* 
     * Testaa, että käyttäjä pystyy muokkaamaan elokuvaa, jos tiedot ovat oikeat
     * Testaa myös, että Firebasea käyttävästä palvelusta kutsutaan oikeaa funktiota,
     * käyttämällä toBeCalled-oletusta.
     */
    it('should be able to edit a movie by its name, director, release date and description', function () {
        scope.editName = 'Elokuva';
        scope.editMovie(scope.movie);
        expect(scope.movie.name).toBe('Elokuva');
        expect(scope.movie.director).toBe('Kalle Ilves');
        expect(FirebaseServiceMock.editMovie).toHaveBeenCalled();
    });

    /*
     * Testaa, ettei käyttäjä pysty muokkaaman elokuvaa, jos tiedot eivät ole oikeat
     * Testaa myös, että Firebasea käyttävästä palvelusta ei kutsuta muokkaus-funktiota,
     * käyttämällä not.toBeCalled-oletusta.
     */
    it('should not be able to edit a movie if its name, director, release date or description is empty', function () {
        scope.editName = '';
        scope.editMovie(scope.movie);
        expect(scope.movie.name).toBe('Joku leffa');
        expect(FirebaseServiceMock.editMovie).not.toHaveBeenCalled();
    });
});