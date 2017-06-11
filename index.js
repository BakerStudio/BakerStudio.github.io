var SOURCES_URL = "https://newsapi.org/v1/sources";
var ARTICLES_URL = "https://newsapi.org/v1/articles";
var API_KEY = "b54b01d96a8b4fac8b2e60a8211e8c2c";
var sources = []; // state for the source periodicals
var articles = []; // state for all the articles in the sources selected by user
var currentPeriodicalTitle = '';
var ARTICLE_STATUS_COLLAPSED = 0;
var ARTICLE_STATUS_EXPANDED = 1;
var ARTICLE_STATUS_DELETED = 2;
var logos = {
      Bloomberg: "logos/Bloomberg.png",
      'Business Insider': "logos/Business-insider.png",
      'Business Insider (UK)': "logos/Business-insider.png",
      Buzzfeed: "logos/buzzfeed-logo.jpg",
      CNBC: "logos/cnbc_logo.gif",
      'The Wall Street Journal': "logos/WSJ.png",
      Fortune: "logos/fortune.gif",
      'Financial Times': "logos/financial-times.png",
      'The Economist': "logos/the-economist-logo.gif",
      'Daily Mail': "logos/daily-mail.jpeg",
      'Entertainment Weekly': "logos/entertainment-weekly.jpg",
      'The Lad Bible': "logos/the-lad-bible.jpg",
      Mashable: "logos/mashable-logo.png",
      'The Washington Post': "logos/washington-post.png",
      IGN: "logos/ign.png",
      Polygon: "logos/polygon.jpg",
      'ABC News (AU)': "logos/abc-news-au.jpg",
      'Al Jazeera English': 'logos/aljazeera.jpg',
      'Associated Press': 'logos/ap.gif',
      'BBC News': 'logos/bbc_news.png',
      CNN: "logos/CNN-Logo.jpg",
      'Google News': "logos/google-news.png",
      "Breitbart News": "logos/breitbart.jpg",
      'The Guardian (AU)': "logos/guardian-au.png",
      'The Guardian (UK)': "logos/guardian-uk.png",
      'The Hindu': "logos/hindu.jpeg",
      'The Huffington Post': "logos/huff-post.png",
      Independent: "logos/indy.png",
      'National Geographic': "logos/nat-geo2.jpg",
      'New Scientist': "logos/new-sci.jpg",
      'Metro': "logos/metro.png",
      'Mirror': "logos/mirror.jpg",
      'New York Magazine': "logos/nymag.png",
      'The New York Times': "logos/nytimes.jpg",
      'Newsweek': "logos/newsweek.png",
      'Reddit /r/all': "logos/reddit.png",
      Reuters: "logos/reuters.jpg",
      'The Telegraph': "logos/telegraph.jpg",
      Time: "logos/time-logo.png",
      'The Times of India': "logos/times-india.png",
      'USA Today': "logos/usa-today.jpg",
      'MTV News': "logos/mtv-news-logo.png",
      'MTV News (UK)': "logos/mtv-logo.png",
      'BBC Sport': "logos/bbc-sport.jpg",
      ESPN: "logos/espn.jpg",
      'ESPN Cric Info': "logos/cric-info.jpg",
      'Football Italia': "logos/football-italia.jpeg",
      'FourFourTwo': "logos/fourfourtwo.png",
      'Fox Sports': "logos/fox-sports.png",
      'NFL News': "logos/nfl.jpg",
      'The Sport Bible': "logos/sport-bible.png",
      TalkSport: "logos/talksport.jpg",
      'Ars Technica': "logos/ars.png",
      Engadget: "logos/engadget.png",
      'Hacker News': "logos/hacker.png",
      'The Next Web': "logos/tnw.png",
      Recode: "logos/recode.jpg",
      TechCrunch: "logos/techcrunch.jpg",
      TechRadar: "logos/techradar.jpg",
      'The Verge': "logos/verge.png"
}


function dateSpan(pubDate) {

  if (pubDate == null) {
    return "published date not provided";
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
    // console.log("name: " + sources[i].name);  //temp
  }
  $('.nav').html(text);
}


function renderArticles() {
  var i;
  var text = '';
  var author;
  var description;

  for (i = 0; i < articles.length; i++) {
    if (articles[i].status != ARTICLE_STATUS_DELETED) {
      text = text + '<article class="article-container"><div class="title-row" ' +
        'data-article-id="' + articles[i].url + '">' +
        '<img src="' + logos[articles[i].sourceTitle] + '" class="logo">' +
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

      //  Check if author and description are provided. If not, handle the null case.

      if (articles[i].author == null) {
        author = "Author not provided"
      } else {
        author = "By " + articles[i].author;
      }
      if (articles[i].description == null) {
        description = "Description not provided"
      } else {
        description = articles[i].description;
      }

      text = text + '<img class="detail-URLImage" src="' + articles[i].urlToImage + '">' +
        '<p class="detail-author">' + author + '</p>' +
        '<p class="detail-desc">' + description + '</p></div></article>';
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
