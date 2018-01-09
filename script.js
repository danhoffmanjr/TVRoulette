"Use Strict";

(function () {
    var httpRequest,
        apiKey = '064fa487e5692b71cd7d4bd13fc74a30',
        baseURL = "https://api.themoviedb.org/3/",
        imageBaseURL = "https://image.tmdb.org/t/p/w500",
        getDetailsURL = "{collection}/{selection_id}?api_key="+apiKey+"&language=en-US",
        method = {
          post : 'POST',
          get : 'GET'
        },
        output = document.querySelector("#output"),
        genresSelect = document.querySelector("#select-genre"),
        collection = document.querySelector("#select-collection"),
        minPage = 1,
        maxPage = 1,
        page = '1',
        selectionDetails = {};

    collection.addEventListener('change', function(){
      if(this.value == "select"){
        genresSelect.innerHTML = "";
      }else if(this.value == "movie"){
        queryGenres(method.get, 'genre/movie/list?api_key='+apiKey+'&language=en-US');
        collection = 'movie';
      }else{
        queryGenres(method.get, 'genre/tv/list?api_key='+apiKey+'&language=en-US');
        collection = 'tv';
      }
    });

    document.getElementById("btn-spin").addEventListener('click', function(){
      if(collection.value == "select"){
        alert("Select 'Movie' or 'TV Show' from the menu to play.");
      }else {
        spinRoulette(method.get, 'discover/'+collection+'?api_key='+apiKey+'&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres='+genresSelect.value);    
      }
    });

    function spinRoulette(method, uri) {
      httpRequest = new XMLHttpRequest();
      if (!httpRequest) {
        console.log('ERROR spinning Roulette: Cannot create an XMLHTTP instance');
        return false;
      }
      httpRequest.open(method, baseURL + uri);
      httpRequest.onreadystatechange = function (){
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            console.log("Dataset for " + collection + " collection in the " + genresSelect.value + " genre:");
            console.log(data);
            var newURI;
            maxPage = data.total_pages;
            page = getRandomInt(minPage, maxPage);
            newURI = baseURL + uri + '&page=' + page;
            renderSelection(method, newURI);
          } else {
            console.log('There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function renderSelection(method, uri) {
      httpRequest = new XMLHttpRequest();
      if (!httpRequest) {
        console.log('ERROR spinning Roulette: Cannot create an XMLHTTP instance');
        return false;
      }
      httpRequest.open(method, uri);
      httpRequest.onreadystatechange = function (){
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            var randomIndex = getRandomInt(0,19);
            var selection = data.results[randomIndex];
            var detailsURI = getDetailsURL.replace("{collection}", collection);
            detailsURI = detailsURI.replace("{selection_id}", selection.id);
            console.log("Random Selection:");
            console.log(selection);
            getFullDetails(method, detailsURI);
            console.log("Selection Details:");
            console.log(selectionDetails);
            output.innerHTML = "";
            if(selection.title == undefined){
              output.innerHTML += '<h3>' + selectionDetails.name + '</h3>';
            }else{
              output.innerHTML += '<h3>' + selectionDetails.title + '</h3>';
            }
            output.innerHTML += '<p>' + selectionDetails.overview + '</p>' +
                                '<p><img src="' + imageBaseURL + selection.poster_path + '"></p>' + 
                                '<p><a href="http://www.imdb.com/title/' + selectionDetails.imdb_id + '/">IMDB</a></p>';
          } else {
            console.log('There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function getFullDetails(method, uri) {
      httpRequest = new XMLHttpRequest();
      if (!httpRequest) {
        console.log('ERROR spinning Roulette: Cannot create an XMLHTTP instance');
        return false;
      }
      httpRequest.open(method, baseURL + uri);
      httpRequest.onreadystatechange = function (){
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            selectionDetails = JSON.parse(httpRequest.responseText);
          } else {
            console.log('There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }
  
    function queryGenres(method, uri) {
      httpRequest = new XMLHttpRequest();
      if (!httpRequest) {
        console.log('ERROR getting genres: Cannot create an XMLHTTP instance');
        return false;
      }
      httpRequest.open(method, baseURL + uri);
      httpRequest.onreadystatechange = function (){
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            var genres = JSON.parse(httpRequest.responseText);
            createGenresSelect(genres.genres);
          } else {
            console.log('There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function createGenresSelect(genreArr){
      console.log("GENRES Select change: List of Genres for " + collection + ":");
      console.log(genreArr);
      genresSelect.innerHTML = "";
      var option;
      genreArr.forEach(element => {
        option = '<option value="' + element.id + '">' + element.name + '</option>';
        genresSelect.innerHTML += option;
      });
    }

    function displayTitles(data){
      data.forEach((element, index) => {
        console.log(index + " " + element.title);
      });
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

})();