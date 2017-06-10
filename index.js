var SOURCES_URL = "https://newsapi.org/v1/sources";
var ARTICLES_URL = "https://newsapi.org/v1/articles";
var API_KEY = "b54b01d96a8b4fac8b2e60a8211e8c2c";
var sources = []; // state for the source periodicals
var articles = []; // state for all the articles in the sources selected by user
var currentPeriodicalTitle = '';
var ARTICLE_STATUS_COLLAPSED = 0;
var ARTICLE_STATUS_EXPANDED = 1;
var ARTICLE_STATUS_DELETED = 2;


function dateSpan(pubDate) {

  if (pubDate == null) {
    return "not provided";
  }

  // Normalize publishedAt date and the system date in terms of millisecs
  // since the epoch date of Jan 1, 1970. Calculate the difference.

  var diff = new Date().getTime() - Date.parse(pubDate);

  //  Determine number of days and hours

  var milliDays = 24 * 60 * 60 * 1000;
  days = Math.floor(diff / milliDays);
  var remainder = diff - (days * milliDays);
  var milliHours = 60 * 60 * 1000;
  hours = Math.floor(remainder / milliHours);

  // Stringify the date span,  e.g., "x days, y hours"

  var text = '';

  if (days == 0 && hours == 0) {
    return "within the hour";
  }
  if (days == 1) {
    text = days + " day";
  } else if (days > 1) {
    text = days + " days";
  }
  if (days > 0 && hours > 0) {
    text = text + ", ";
  }
  if (hours == 1) {
    text = text + hours + " hour ago";
  } else if (hours > 1) {
    text = text + hours + " hours ago";
  }

  return text;
}


function returnSources(data) {
  var displayName = '';
  var text = '';
  var catHeader = '';

  //  save the returned periodicals into the state array

  for (var i = 0; i < data.sources.length; i++) {

    //  Change "Sport" to "Sports", based on user input

    if (data.sources[i].category == "sport") {
      data.sources[i].category = "sports";
    }

    //  Change "Science-and-Nature" category name to
    //  "Science/Nature", according to user input

    if (data.sources[i].category == "science-and-nature") {
      data.sources[i].category = "science/nature";
    }

    //  Create a sort name for the periodicals by ignoring
    //  leading "The" in the name

    if (data.sources[i].name.substring(0, 4) == "The ") {
      displayName = data.sources[i].name.substring(4, data.sources[i].name.length)
    } else {
      displayName = data.sources[i].name;
    }

    sources[i] = {
      category: data.sources[i].category,
      name: data.sources[i].name,
      sourceId: data.sources[i].id,
      url: data.sources[i].url,
      sortName: displayName
    };
  }

  // sort by category and then by periodical
  // name within the category

  sources.sort(function(a, b) {
    if (a.category == b.category) {
      if (a.sortName < b.sortName) {
        return -1;
      } else return 1;
    }
    if (a.category < b.category) {
      return -1;
    } else return 1;
  });

  //  Create the periodicals display. The category heading is first followed by
  //  the periodicals in that category.

  for (i = 0; i < sources.length; i++) {
    if (catHeader != sources[i].category) {
      text = text + '<p class="js-category">' + sources[i].category.toUpperCase() + '</p>';
      catHeader = sources[i].category;
    }
    text = text + '<p class="js-periodical" id="' + i + '">' + sources[i].name + '</p>';
  }
  $('.nav').html(text);
}


function renderArticles() {
  var i;
  var text = '';

  for (i = 0; i < articles.length; i++) {
    if (articles[i].status != ARTICLE_STATUS_DELETED) {
      text = text + '<article class="article-container"><div class="title-row" ' +
        'data-article-id="' + articles[i].url + '">' +
        '<span class="article-source">' + articles[i].sourceTitle + ' - ' + dateSpan(articles[i].publishedAt) +
        '</span><div class="button-box" data-row-id="' + i + '">' +
        '<div class="expand-button"><img src="assets/expand-4.svg" title="Expand/collapse details"></div>' +
        '<div class="tab-button"><img src="assets/opentab.svg" title="Open browser tab"></div>' +
        '<div class="delete-button"><img src="assets/trashcan.svg" title="Delete article"></div>' +
        '</div></div><p class="article-title">' + articles[i].title + '</p></div>';

      text = text + '<div class="detail';
      if (articles[i].status == ARTICLE_STATUS_COLLAPSED) {
        text = text + ' hidden">';
      }
      if (articles[i].status == ARTICLE_STATUS_EXPANDED) {
        text = text + '">';
      }
      text = text + '<img class="detail-URLImage" src="' + articles[i].urlToImage + '">' +
        '<p class="detail-author">By ' + articles[i].author + '</p>' +
        '<p class="detail-desc">' + articles[i].description + '</p></div></article>';
    }
  }

  $('.content').html(text);
}


function returnArticles(data) {
  var j;

  //  Add the returned articles to the articles state array. Note that
  //  there may be existing articles already in the array.

  for (j = 0; j < data.articles.length; j++) {
    articles.push(data.articles[j]);
    articles[articles.length - 1].status = ARTICLE_STATUS_COLLAPSED;
    articles[articles.length - 1].sourceTitle = currentPeriodicalTitle;
  }
  renderArticles();
}


$(function() {
  'use strict';

  //  Get the sources/periodicals and display them
  //  in the nav menu

  var parms = {
    language: "en" // English language sources only
  };
  $.getJSON(SOURCES_URL, parms, returnSources);

  //  Register the event handler for clicking on a periodical in the
  //  nav menu. If a periodical is clicked, obtain the articles

  $(".nav").on('click', '.js-periodical', function(event) {
    event.preventDefault();
    var x = $(this)['0'].id;
    currentPeriodicalTitle = sources[x].name;
    parms = {
      source: sources[x].sourceId,
      apiKey: API_KEY
    };
    $.getJSON(ARTICLES_URL, parms, returnArticles);
  });

  //  Register event handlers for clicking on an article's buttons --
  //  the expand or compress button, open in browser tab button, or delete button.

  $('.content').on('click', '.delete-button', function(event) {
    event.preventDefault();
    var x = $(this)["0"].parentNode.attributes[1].value;
    articles[x].status = ARTICLE_STATUS_DELETED;
    renderArticles();
  });

  $('.content').on('click', '.expand-button', function(event) {
    event.preventDefault();
    var x = $(this)["0"].parentNode.attributes[1].value;
    if (articles[x].status == ARTICLE_STATUS_COLLAPSED) {
      articles[x].status = ARTICLE_STATUS_EXPANDED;
    } else {
      articles[x].status = ARTICLE_STATUS_COLLAPSED;
    }
    renderArticles();
  });

  $('.content').on('click', '.tab-button', function(event) {
    event.preventDefault();
    var x = $(this)["0"].parentNode.attributes[1].value;
    window.open(articles[x].url, '_blank');
  });

})
