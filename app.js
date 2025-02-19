$(document).ready(function () {
    const apiUrl = 'https://your-vercel-deployment-url/api';
    
    function loadMovies(templateSelector) {
        const goodNote = $('#goodNote').val();
        const badNote = $('#badNote').val();
        const origineFilm = $('#FiltrePays').val();
        const niveau = templateSelector === 'banger' ? 'Classic' : templateSelector === 'navet' ? 'Navet' : null;

        $('#goodNote').parent().hide();
        $('#badNote').parent().hide();
        $('#movies-container').empty();

        const queryParams = {
            origine: origineFilm !== "TOUS" ? origineFilm : undefined,
            niveau: niveau,
            minNote: niveau === 'Classic' ? goodNote : undefined,
            maxNote: niveau === 'Navet' ? badNote : undefined
        };

        $.ajax({
            url: 'http://localhost:3000/movies',
            data: queryParams,
            dataType: 'json',
            success: function (moviesData) {
                const container = $('#movies-container');

                $.each(moviesData, function (i, movie) {
                    let templateId;

                    if (origineFilm !== "TOUS" && movie.origine !== origineFilm) {
                        return;
                    }

                    if (templateSelector == 'banger' && movie.note >= goodNote) {
                        templateId = 'banger';
                    } else if (templateSelector == 'navet' && movie.note <= badNote) {
                        templateId = 'navets';
                    } else if (templateSelector == 'all') {
                        if (movie.note >= goodNote) {
                            templateId = 'banger';
                        } else if (movie.note <= badNote) {
                            templateId = 'navets';
                        } else {
                            templateId = 'movie-template';
                        }
                    }

                    if (templateId) {
                        const template = document.getElementById(templateId);
                        const instance = document.importNode(template.content, true);

                        $(instance).find('.nom').text(movie.nom);
                        $(instance).find('.dateDeSortie').text(movie.dateDeSortie);
                        $(instance).find('.realisateur').text(movie.realisateur);
                        $(instance).find('.note').text(movie.note);
                        $(instance).find('.notePublic').text(movie.notePublic || 'N/A');
                        $(instance).find('.compagnie').text(movie.compagnie);
                        $(instance).find('.description').text(movie.description);
                        $(instance).find('.lienImage').attr('src', movie.lienImage);

                        if (movie.notePublic > 0) {
                            const criticNote = movie.note;
                            const publicNote = movie.notePublic || 0;
                            const difference = Math.abs(criticNote - publicNote).toFixed(1);
                            $(instance).find('.noteDifference').text(difference);
                        } else {
                            $(instance).find('.noteDifference').text('Note public indisponible');
                        }

                        $(instance).find('.delete-button').attr('data-id', movie.id);
                        $(instance).find('.edit-button').attr('data-id', movie.id);

                        container.append(instance);
                    }
                });

                $('.delete-button').on('click', function () {
                    const movieId = $(this).attr('data-id');
                    $.ajax({
                        url: `http://localhost:3000/movies/${movieId}`,
                        type: 'DELETE',
                        success: function (result) {
                            alert('Film supprimé avec succès');
                            loadMovies(templateSelector);
                        },
                        error: function (xhr, status, error) {
                            console.error("Erreur " + error);
                        }
                    });
                });

                $('.edit-button').on('click', function () {
                    const movieId = $(this).attr('data-id');
                    const movieCard = $(this).closest('.movie-card');
                    const movieData = {
                        nom: movieCard.find('.nom').text(),
                        dateDeSortie: movieCard.find('.dateDeSortie').text(),
                        realisateur: movieCard.find('.realisateur').text(),
                        notePublic: movieCard.find('.notePublic').text(),
                        note: movieCard.find('.note').text(),
                        compagnie: movieCard.find('.compagnie').text(),
                        description: movieCard.find('.description').text(),
                        origine: movieCard.find('.origine').text(),
                        lienImage: movieCard.find('.lienImage').attr('src')
                    };

                    $('#editMovieId').val(movieId);
                    $('#editNom').val(movieData.nom);
                    $('#editDateDeSortie').val(movieData.dateDeSortie);
                    $('#editRealisateur').val(movieData.realisateur);
                    $('#editNotePublic').val(movieData.notePublic);
                    $('#editNote').val(movieData.note);
                    $('#editCompagnie').val(movieData.compagnie);
                    $('#editDescription').val(movieData.description);
                    $('#editOrigine').val(movieData.origine);
                    $('#editLienImage').val(movieData.lienImage);

                    $('#editMovieForm').show();
                });
            },
            error: function (xhr, status, error) {
                console.error("Erreur " + error);
            }
        });
    }

    $('#loadMoviesButton').on('click', function () {
        $(this).hide();
        $('#movies-container').addClass('fade-in');
        loadMovies('all');
    });

    $('#importBanger').on('click', function () {
        $(this).hide();
        $('#movies-container').addClass('fade-in');
        loadMovies('banger');
    });

    $('#importNavets').on('click', function () {
        $(this).hide();
        $('#movies-container').addClass('fade-in');
        loadMovies('navet');
    });

    $('#clearButton').on('click', function () {
        $('#loadMoviesButton').show();
        $('#importBanger').show();
        $('#importNavets').show();
        $('#goodNote').parent().show();
        $('#badNote').parent().show();
        $('#FiltrePays').val("");
        $('#movies-container').empty();
        $('#addMovieForm').hide(); // Hide the add movie form
        $('#editMovieForm').hide(); // Hide the edit movie form
    });

    $('#addMovieButton').on('click', function () {
        $('#addMovieForm').toggle();
    });

    $('#addMovieForm').on('submit', function (e) {
        e.preventDefault();

        const newMovie = {
            nom: $('#nom').val(),
            dateDeSortie: $('#dateDeSortie').val(),
            realisateur: $('#realisateur').val(),
            notePublic: $('#notePublic').val(),
            note: $('#note').val(),
            compagnie: $('#compagnie').val(),
            description: $('#description').val(),
            origine: $('#origine').val(),
            lienImage: $('#lienImage').val()
        };

        $.ajax({
            url: 'http://localhost:3000/movies',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newMovie),
            success: function (result) {
                alert('Film ajouté avec succès');
                $('#addMovieForm')[0].reset();
                $('#addMovieForm').hide();
                loadMovies('all');
            },
            error: function (xhr, status, error) {
                console.error("Erreur " + error);
            }
        });
    });

    $('#editMovieForm').on('submit', function (e) {
        e.preventDefault();

        const movieId = $('#editMovieId').val();
        const updatedMovieData = {
            nom: $('#editNom').val(),
            dateDeSortie: $('#editDateDeSortie').val(),
            realisateur: $('#editRealisateur').val(),
            notePublic: $('#editNotePublic').val(),
            note: $('#editNote').val(),
            compagnie: $('#editCompagnie').val(),
            description: $('#editDescription').val(),
            origine: $('#editOrigine').val(),
            lienImage: $('#editLienImage').val()
        };

        $.ajax({
            url: `http://localhost:3000/movies/${movieId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedMovieData),
            success: function (response) {
                alert('Film modifié avec succès');
                $('#editMovieForm')[0].reset();
                $('#editMovieForm').hide();
                loadMovies('all');
            },
            error: function (xhr, status, error) {
                console.error("Erreur " + error);
            }
        });
    });
});
