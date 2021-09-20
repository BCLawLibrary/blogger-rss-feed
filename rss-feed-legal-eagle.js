$(document).ready(function() {

  var url = 'https://bclegaleagle.blogspot.com/feeds/posts/default?alt=json';
  var defaultImage = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-default-500x500.jpg';
  var option2Image = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-option2-502x502.jpg';
  var option3Image = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-option3-500x500.jpg';
  var imageOptions = [defaultImage, option2Image, option3Image];
  var imageOption = 1;
  var ImageSize='500';
  $.getJSON(
    url + '&callback=?')
    .done(function(data){
      $.each(
        data.feed.entry || [],
        function(i, e){
          if (i<4) {
            var title = (e.title.$t || '');
            if (title.length>75) {
		       title=title.replace(/^(.{70}[^\s]*).*/, "$1")+"...";
	        };
			
			var postContent = (e.content.$t || '');
		  	postContent = postContent.replace(/<br[^>]*>/g, ' ');
		  	content = $.parseHTML(postContent);
		  	var $content = $(content);
			var thumbnail;
            
			var url = (e.link || []).pop().href;
			var date = new Date(e.updated.$t || Date.now());
			if (e.media$thumbnail){
			  thumbnail = (e.media$thumbnail.url || '');
	 		  thumbnail = thumbnail.replace(/(w[0-9]+-h[0-9]+)|(s[0-9]+-c)|(s[0-9]+-w[0-9]+-h[0-9]+-c)/,"s"+ImageSize+"-c");
 			}
			else {
			  //pull image from post if available
			  if ($content.find('img').addBack('img').length > 0) {
				$content.find('img').addBack('img').each(function(i, value) {
					if (!(e.media$thumbnail) || e.media$thumbnail.url.includes('cc-logo.png')) {
					  if (($(this).attr('height')> 200) && ($(this).attr('width') > 200)) {
						e.media$thumbnail = {
						  url: $(this).attr('src'),
						  width: $(this).attr('width'),
						  height: $(this).attr('height')
						};
						console.log(e.media$thumbnail);
						thumbnail = e.media$thumbnail.url;
						thumbnail = thumbnail.replace(/(w[0-9]+-h[0-9]+)|(s[0-9]+-c)|(s[0-9]+-w[0-9]+-h[0-9]+-c)/,"s"+ImageSize+"-c");
					  }
					}
				})//end each loop
			  }
			  //use default image if needed
			  if (!(e.media$thumbnail)) {
				thumbnail=imageOptions[imageOption-1];
				if (imageOption < imageOptions.length){
					imageOption++;
				  }
				  else {
					imageOption = 1;
				  }
			  }
			}

 			var content = (e.content.$t || '');
 			if (e.category) {
 			  var category = (e.category[0].term || '');
 			}
 			var author = (e.author[0].name.$t || '');

 			var outerdiv =$('<div>')
			  .addClass('col-md-3 col-sm-6 col-xs-12');

 			var innerdiv =$('<div>')
			  .addClass('blogger-item');

 			var textdiv =$('<div>')
			  .addClass('blogger-text');

			var imgBox = $('<div>')
			  .addClass('image-sizer');
			
			var imglink = $('<a>)')
			  .attr('href', url)
	   		  .addClass('blogger-image');

			var img = $('<img>')
			  .attr('src', thumbnail, 'alt', title)
			  .appendTo(imglink);

			
			$(imglink).appendTo(imgBox);
			$(imgBox).appendTo(innerdiv);

			var categoryP = $('<p>')
			  .text(category)
			  .addClass('blogger-category')
			  .appendTo(textdiv);

			var header = $('<h3>');

			var a = $('<a>')
			  .text(title)
			  .attr('href', url)
			  .appendTo(header);

			$(header).appendTo(textdiv);

			var p = $('<p>')
			  .text("Posted by " + author)
			  .addClass('blogger-author')
			  .appendTo(textdiv);

			$(textdiv).appendTo(innerdiv);
			$(innerdiv).appendTo(outerdiv);

			$(outerdiv).appendTo('#blogger');


 			$('.blogger-content-div img, .separator').hide();
 		  }
		  // do your stuff here
      	});
  	})
    .fail(function(){
    // handle failure here
    });

});
