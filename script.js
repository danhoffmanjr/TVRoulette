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
        collectionValue,
        minPage = 1,
        maxPage = 1,
        page = '1';

    collection.addEventListener('change', function(){
      if(this.value == "select"){
        genresSelect.innerHTML = "";
        collectionValue = "";
        collection.style.color = "#aaa";
        genresSelect.style.color = "#aaa";
      }else if(this.value == "movie"){
        queryGenres(method.get, 'genre/movie/list?api_key='+apiKey+'&language=en-US');
        collectionValue = 'movie';
        collection.style.color = "red";
        genresSelect.style.color = "red";
      }else{
        queryGenres(method.get, 'genre/tv/list?api_key='+apiKey+'&language=en-US');
        collectionValue = 'tv';
        collection.style.color = "red";
        genresSelect.style.color = "red";
      }
    });

    document.getElementById("btn-spin").addEventListener('click', function(){
      if(collection.value == "select"){
        alert("Select 'Movie' or 'TV Show' from the menu to play.");
      }else {
        spinRoulette(method.get, 'discover/'+collectionValue+'?api_key='+apiKey+'&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres='+genresSelect.value);    
        this.innerText = "Spin Again";
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
            console.log("Dataset for " + collectionValue + " collection in the " + genresSelect.value + " genre:");
            console.log(data);
            var newURI;
            maxPage = data.total_pages;
            page = getRandomInt(minPage, maxPage);
            newURI = baseURL + uri + '&page=' + page;
            getSelection(method, newURI);
          } else {
            console.log('[spinRoulette] There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function getSelection(method, uri) {
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
            var detailsURI = getDetailsURL.replace("{collection}", collectionValue);
            detailsURI = detailsURI.replace("{selection_id}", selection.id);
            getFullDetails(method, detailsURI);
            console.log("Random Selection:");
            console.log(selection);
          } else {
            console.log('[getSelection] There was a problem with the request.');
            spinRoulette('GET', 'discover/'+collectionValue+'?api_key='+apiKey+'&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres='+genresSelect.value);
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
            httpRequest.onload = function() {
              var details = JSON.parse(httpRequest.responseText);
              renderDetails(details);
              console.log("Full Selection Details:");
              console.log(details);
            }
          } else {
            console.log('[getFullDetails] There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function renderDetails(data){
      output.innerHTML = "";
      if(data.poster_path == null){
        var imgPoster = "no-photo.jpg";
      }else{
        var imgPoster = imageBaseURL + data.poster_path;
      }
      //display release date if available
      if(data.release_date == undefined || data.release_date == null || data.release_date == ""){
        var releaseDate = "";
      }else{
        var releaseDate = '<li>Release Date: '+ data.release_date +'</li>';
      }
      //display IMDB link if available
      if(data.imdb_id == undefined || data.imdb_id == null || data.imdb_id == ""){
        var imdbURL = "";
      }else{
        var imdbURL = '<li>IMDB Page: <a href="http://www.imdb.com/title/' + data.imdb_id + '/" target="_blank">http://www.imdb.com/title/' + data.imdb_id + '</a></li>';
      }
      //display website link if available
      if(data.homepage == undefined || data.homepage == null || data.homepage == ""){
        var websiteURL = "";
      }else{
        var websiteURL = '<li>Website: <a href="'+ data.homepage +'" target="_blank">'+ data.homepage +'</a></li>';
      }
      var extraDetails = '<p class="rating">Average Viewer Rating: <span>' + data.vote_average + '</span> ('+ data.vote_count +' reviews)</p><p>' + data.overview + '</p><ul>' + imdbURL + websiteURL + releaseDate + '</ul></div>';
      output.innerHTML += '<div class="poster"><img src="' + imgPoster + '"></div>';
      if(data.title == undefined){
        output.innerHTML += '<div class="details"><h3>' + data.name + '</h3>' + extraDetails;
      }else{
        output.innerHTML += '<div class="details"><h3>' + data.title + '</h3>' + extraDetails;
      }
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
            console.log('[queryGenres] There was a problem with the request.');
          }
        }
      };
      httpRequest.send();
    }

    function createGenresSelect(genreArr){
      console.log("GENRES Select change: List of Genres for " + collectionValue + ":");
      console.log(genreArr);
      genresSelect.innerHTML = "";
      var option;
      genreArr.forEach(element => {
        genresSelect.innerHTML += '<option value="' + element.id + '">' + element.name + '</option>';
      });
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

})();