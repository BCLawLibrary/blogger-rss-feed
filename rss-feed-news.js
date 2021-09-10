//there is just one function for this script
function feeds () {
  function dayOfWeekAsString(dayIndex) {
	return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex];
  }
  function monthAsString(monthIndex) {
    return ["January","February","March","April","May","June","July","August","September","October","November","December"][monthIndex];
  }
  //set variables for feed, default image and thumbnail image size
  var newsUrl = 'https://bclawlibrary.blogspot.com/feeds/posts/default?alt=json';
  var eagleUrl = 'https://bclegaleagle.blogspot.com/feeds/posts/default?alt=json';
  var defaultImage = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-default-500x500.jpg';
  var option2Image = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-option2-502x502.jpg';
  var option3Image = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-option3-500x500.jpg';
  var imageOptions = [defaultImage, option2Image, option3Image];
  var imageOption = 1;
  var ImageSize='500';

  var newsData, eagleData;

  //add grid-sizer div for resizing masonry columns in responsive layours
  var div = $('<div/>')
    .addClass('grid-sizer')
    .appendTo('#blogger');

  //get RSS feed data
  $.when(
    $.getJSON(newsUrl+ '&callback=?', function(data) {
      newsData = data;
    }),
    $.getJSON(eagleUrl+ '&callback=?', function(data) {
      eagleData = data;
    })
  ).then(function() {
    //when data is ready, combine the two feeds
    var posts = newsData.feed.entry.concat(eagleData.feed.entry);
    //sort the result by date published
    function dateSort(a, b) {
      return new Date(b.published.$t).getTime() - new Date(a.published.$t).getTime();
    }
    posts.sort(dateSort);
    //write the feed to the console - useful for getting field names and degbugging. remove in final code
      //console.log(posts);
    //loop through the posts
    $.each(
      posts || [],
      function(i, e){
        //set the number of posts to write to the page. Since different viewports require different numbers of posts, write the maximum number needed and hide extra posts using CSS. This way the posts are available if the window size changes
		if (i<=50) {
	      //GET FROM FEED -----------first get all of the needed information about each post
		  //TITLE - max characters is 75 ------------------------------------
		  var title = (e.title.$t || '');
		  if (title.length>75) {
		    title=title.replace(/^(.{70}[^\s]*).*/, "$1")+"...";
		  };

		  //URL -------------------------------------------------------------
		  var url = (e.link || []).pop().href;

	      //BLOG SOURCE - which blog does this come from?--------------------
		  //options: bclawlibrary and bclegaleagle
		  var source = url.split("/")[2].split(".")[0];
      	  var sourceFormatted = ""
      	  switch (source) {
            case 'bclawlibrary':
              sourceFormatted = 'Law Library News'
              break;
            case 'bclegaleagle':
              sourceFormatted ='Legal Eagle Blog'
              break;
            default:
              sourceFormatted = 'Law Library'
              break;
          };


	      //DATE -- copied from FB-------------------------------------------

		  var postDate= new Date(Date.parse(e.updated.$t.split("T")[0]));
		  postDate.setDate(postDate.getDate() + 1);

		  var postDay = postDate.getDate();
		  var postDayofWeek=dayOfWeekAsString(postDate.getDay());
		  var postMonth=monthAsString(postDate.getMonth());
		  var postYear=postDate.getFullYear();
		  var formattedDate = postDayofWeek +", "+postMonth+" "+postDay+", "+postYear;

          //CATEGORY - only grabs the first. --------------------------------
          //Used to tag bclawlibrary posts as postType:long by using category: "long post"
          if (e.category) {
            var category = (e.category[0].term || '');
          }

		  //CONTENT ---------------------------------------------------------

		  var postContent = (e.content.$t || '');
		  postContent = postContent.replace(/<br[^>]*>/g, ' ');
		  content = $.parseHTML(postContent);
		  var $content = $(content);
		  var displayContent = '';
      	  var outsideLink = '';
      	  var ccLink = '';
		  var ccInner = '';
          if ($content.find('a').addBack('a').length >0 ) {
            $content.find('a').addBack('a').each(function(i, value) {
              if ($(this).attr('href').includes('jpg')) {
              }
              else if ($(this).attr('href').includes('png')) {
              }
              else {
                outsideLink = $(this).attr('href');
                return false;
              }
            })//end each loop
          };//end if statement

          if ($content.find('img').addBack('img').length >0 ) {
            $content.find('img').addBack('img').each(function(i, value) {
              if ($(this).attr('src').includes('cc-logo.png')) {
                ccLink = $('<div>')
                .addClass('ccLink');
                ccInner  = $(this).parent()
                  .attr('target', '_blank');
                if ($(ccInner).attr('href').includes('cc-logo.png')) {
                  $(ccInner).removeAttr('href');
                  $(ccLink).addClass('noLink');
                }
                $(ccInner)
                  .appendTo(ccLink);
			  } else if (!(e.media$thumbnail) || e.media$thumbnail.url.includes('cc-logo.png')) {
				//catch instances when the post fails to provide a thumbnail
				if (($(this).attr('height')> 100) && ($(this).attr('width') > 100)) {
				  e.media$thumbnail = {
					url: $(this).attr('src'),
					width: $(this).attr('width'),
					height: $(this).attr('height')
				  };
				}
			  }
            })//end each loop
          };//end if statement

		  $content.each(function() {
            var $this = $(this);
		    if (displayContent.length > 700){ //max we might display
			  return false;
		    }
            //console.log (this.nodeName);
            //console.log ($this.html());
            if($this.text().replace(/\s/g,'')!='') {//skip elements containing only whitespace
              displayContent = displayContent + $this.text();
            }
		  });

		  //var contentMatchArray = content.match(/>([^<][^<]*)/);  //Regex doesn't work as well
		  //content = contentMatchArray[1];



	      //AUTHOR - not in use ---------------------------------------------
		  var author = (e.author[0].name.$t || '');

		  //POST TYPE - based on source, content, and tags
		  //Check for social media embeds. Instagram and Facebook working
		  var postType = '';
		  var instagram = false;
		  var facebook = false;
		  var twitter = false;

		  var instagramTest = $content.children('blockquote.instagram-media').prevObject[0].className;
		  if (instagramTest == 'instagram-media'){
			instagram = true;
		  }

		  //Facebook embeds don't work well because the minimum width for Facebook iframes is 350px
		  //We would have to redo the screen size breaks for responsive layouts and have everything be wider
		  var facebookTest = $content.children('iframe').prevObject[0].src;
		  if(facebookTest && facebookTest.search('facebook')){
			facebook = true;
		  }
          //Twitter emnbed
          var twitterTest = $content.children('blockquote').prevObject[0].className;
          if(twitterTest == 'twitter-tweet') {
            twitter = true;
          }



		  //Select one of 3 post types --short(display entire post)/long(display snippet and link to post)/embed(show embedded content)/title(show title only and link to post)
		  if (category == 'long post'){
			postType = 'long';
		  }
		  else if (instagram || facebook || twitter){
			postType = 'embed';
		  }
          else if (category == 'title'){
            postType = 'title';
          }
		  else if (source == 'bclawlibrary' || category == 'short post'){
			postType = 'short';
		  }
		  else {
			postType = 'title';
		  }

          //IMAGE -----------------------------------------------------------
          if (postType=='embed'){ //embeds don't need a thumbnail - assign the first default image just to be safe
            var thumbnail=imageOptions[0];
          }
          else {
            if (e.media$thumbnail){
  			  var thumbnail = (e.media$thumbnail.url || '');
  			  thumbnail = thumbnail.replace(/(w[0-9]+-h[0-9]+)|(s[0-9]+-c)/,"s"+ImageSize+"-c");
  			}
  			//Loop through however many default images we have specified.
  			else {
  			  var thumbnail=imageOptions[imageOption-1];
  			  if (imageOption < imageOptions.length){
  				imageOption++;
  			  }
  			  else {
  				imageOption = 1;
  			  }
  			}
          }

	      //Create structure for posts outerdiv>innerdiv>textdiv
		  var outerdiv =$('<div>')
		    .addClass(source) //the class is the name of the blog the post comes from
			.addClass('blogger-item-wrapper')
			.addClass('grid-item');

          if (facebook) {
            $(outerdiv).addClass('grid-item-width-2');
          }

		  var innerdiv =$('<div>')
		    .addClass('blogger-item')
            .addClass('blogger-item-'+ postType);


		  var textdiv =$('<div>')
			.addClass('blogger-text');

	      //APPEND to the structure you just created
		  //IMAGE -----------------------------------------------------------
		  //postType:long/short --show thumbnail image
		  //postType:embed --don't show thumbnail image
		  switch(postType) {
			case 'long':
            case 'title':
			  var imglink = $('<a>)')
				.attr('href', url)
				.addClass('blogger-image');

			  var img = $('<img>')
				.attr({src: thumbnail, alt: title})
				.appendTo(imglink);

			  $(imglink).appendTo(innerdiv);

			  if (e.media$thumbnail) {
				if ((e.media$thumbnail.height / e.media$thumbnail.width) < 0.75) {
				  $(innerdiv).addClass('short-thumbnail');
				};
			  }
					
			  break;
			case 'short':
              if (outsideLink != '') {
                var imglink = $('<a>)')
    			  .attr('href', outsideLink)
    			  .addClass('blogger-image');

    			var img = $('<img>')
    			  .attr({src: thumbnail, alt: title})
    			  .appendTo(imglink);

    			$(imglink).appendTo(innerdiv);
              }
              else {
				var img = $('<img>')
				  .attr({src: thumbnail, alt: title})
				  .appendTo(innerdiv);
              }
			  break;
			case 'embed':
			  break;
			default:
			  break;
			}

		  //CATEGORY - not in use -------------------------------------------
			//var categoryP = $('<p>')
			//.text(category)
			//.addClass('blogger-category')
			//.appendTo(textdiv);
			//TB removed to get rid of category labels

		  //TITLE -----------------------------------------------------------
		  //Long posts link back, short posts don't
		  switch(postType) {
			case 'long':
            case 'title':
			  var header = $('<h3>');

			  var a = $('<a>')
				.text(title)
				.attr('href', url)
				.appendTo(header);

			  $(header)
				.addClass('postTitle longPostTitle')
				.appendTo(textdiv);
			  break;
			case 'short':

              if (outsideLink != '') {
                var header = $('<h3>');

                var a = $('<a>')
                  .text(title)
                  .attr('href', outsideLink)
                  .appendTo(header);

                $(header)
                  .addClass('postTitle longPostTitle')
                  .appendTo(textdiv);
              }
              else {
                var header = $('<h3>');
				$(header)
				  .text(title)
				  .addClass('postTitle shortPostTitle')
				  .appendTo(textdiv);
              }

			  break;
			case 'embed':
				break;
			default:
				break;
		  }



		  //AUTHOR - not in use ----------------------------------------------
			//var p = $('<p>')
			//.text("Posted by " + author)
			//.addClass('blogger-author')
			//.appendTo(textdiv);
			//TB removed to get rid of authors

		  //CONTENT -----------------------------------------------------------
			//postType:long --display 140 characters along with a "read more" link.
			//postType:short --display 400 characters and no "read more" link.
			//postType:embed --display full content and no "read more" link. (should also figure out a way to isolate non-instagram content and limit to 400 chars
		  switch(postType) {
			case 'long':
			  if (displayContent.length>140) {
				displayContent=displayContent.replace(/^(.{135}[^\s]*).*/, "$1")+"...<a class='readMore' href=" + url + "> read more</a>"; //Cut off if overflows
			  };
			  var div=$('<div>')
				.html(displayContent)
				.addClass('postContent postContentLong')
				.appendTo(textdiv);
			  break;
			case 'short':
			  if (displayContent.length>700) {
				displayContent=displayContent.replace(/^(.{690}[^\s]*).*/, "$1")+"..."; //Cut off at a higher limit
			  };
			  var div=$('<div>')
				.html(displayContent)
				.addClass('postContent postContentShort')
				.appendTo(textdiv);
			  break;
			case 'embed':
			  //if (displayContent.length>400) {
				//displayContent=displayContent.replace(/^(.{390}[^\s]*).*/, "$1")+"..."; //Cut off at a higher limit
			  //};
			  var div=$('<div>')
				.html(postContent) //Display full content for embeds
				.addClass('postContent postContentEmbed')
				.appendTo(innerdiv); //Attach to embeds to inner div, not text div
			  break;
            case 'title':
              var div=$('<div>')
                .addClass('postContent postContentTitle')
                .appendTo(textdiv);
              break;
		    default:
			  break;
		  }
          //DATE------------------------------------------------------------
  		  switch(postType) {
  			case 'long':
  			case 'short':
            case 'title':
  			  var displayDate = $('<p>')
  				.text(formattedDate)
  				.addClass('postDate')
  				.appendTo(div);

  			  break;
  			case 'embed':
  			  break;
  		    default:
  			  break;
  		  }
          //CC logo
          if (ccLink) {
            ccLink.appendTo(div);
          }

          //Logo------------------------------------------------------------
          switch(postType) {
            case 'long':
            case 'title':
              var blogLogo = $('<div>')
                .addClass('blogLogo');
              var logoLink =$('<a>')
                .text(sourceFormatted)
                .attr("href",url)
                .appendTo(blogLogo);


              break;
            case 'short':
              var blogLogo = $('<div>')
                .addClass('blogLogo');
              var logoNoLink =$('<span>')
                .text(sourceFormatted)
                .appendTo(blogLogo);


            case 'embed':
              break;
            default:
              break;
          }

	      //Assemble structure and attach to the page HTML-------------------------
			//append the inner divs to the outer div
			//Don't add the text div and inner div if it's an embed
		  switch(postType) {
			case 'short':
			case 'long':
            case 'title':
			  $(textdiv).appendTo(innerdiv);
              $(blogLogo).appendTo(innerdiv);
				$(innerdiv).appendTo(outerdiv);

			  //write the outer div to the page
			  $(outerdiv).appendTo('#blogger');
			  break;
			case 'embed':
			  $(innerdiv).appendTo(outerdiv);
			  //write the outer div to the page
			  $(outerdiv).appendTo('#blogger');
			  break;

			default:
			  break;
		  }

	      //These might be unnecessary now - actually it seems to be causing problems with Instagram posts
	      //remove spacer images (?) not sure if this is still needed
	      //$('.blogger-content-div img, .separator').hide();
	      //remove styles from the post content
	      //$('.postContent').find('*').removeAttr('style');
	    }
	  }
	);
    //end loop


	// init Masonry
	var $grid = $('.grid').masonry({
	// options...
	columnWidth: '.grid-sizer',
	itemSelector: '.grid-item',
	percentPosition:true,
	transitionDuration: '1.2s'
	});
	//layout Masonry after each image loads
	$grid.imagesLoaded().progress( function() {
	$grid.masonry('layout');
	});

	//layout masonry after any change in the post content area. This means that masonry will update when embedded social media posts load even if the posts are in an iframe
	$('.blogger-item').bind("DOMSubtreeModified", function() {
	$grid.masonry('layout');
	window.setTimeout(function(){$grid.masonry('layout');},200);
	});
	$(window).on("scroll", function() {
	$grid.masonry('layout');
	});



  });
}

//run the feeds function on document ready
$(document).ready(function() {
  feeds();
});
