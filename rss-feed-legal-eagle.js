$(document).ready(function() {
	
var url = 'https://bclegaleagle.blogspot.com/feeds/posts/default?alt=json';
var defaultImage = 'https://bc.edu/content/dam/bc1/schools/law/js/library/rss-feed/rss-default-500x500.jpg';
var ImageSize='500';
$.getJSON(
  url + '&callback=?').
  done(function(data){
    $.each(
      data.feed.entry || [],
      function(i, e){
 if (i<4) {
		  
 var title = (e.title.$t || '');
 if (title.length>75) {
		 title=title.replace(/^(.{70}[^\s]*).*/, "$1")+"...";
	 };
	 
 var url = (e.link || []).pop().href;
 var date = new Date(e.updated.$t || Date.now());
 if (e.media$thumbnail){
	var thumbnail = (e.media$thumbnail.url || '');
	 thumbnail = thumbnail.replace("/s72-c/","/s"+ImageSize+"-c/");
 }
else {
	var thumbnail=defaultImage;
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

var imglink = $('<a>)')
	.attr('href', url)
	.addClass('blogger-image');
	
var img = $('<img>')
	.attr('src', thumbnail, 'alt', title)
	.appendTo(imglink);	
	
$(imglink).appendTo(innerdiv);

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
  }).
  fail(function(){
    // handle failure here
  });

});