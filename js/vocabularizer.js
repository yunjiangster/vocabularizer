
// these are adapted from the jQuery version
Node.prototype.highlight = function(pat) {
 function innerHighlight(node, pat) {
  var skip = 0;
 
  if (node.nodeType == 3) {
  	
   var pos = node.data.toUpperCase().indexOf(pat);
   if (pos >= 0) {
   	
    var spannode = document.createElement('span');
    spannode.className = 'search-highlight';
    var middlebit = node.splitText(pos);
    var endbit = middlebit.splitText(pat.length);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
    
    skip = 1;
   }
   
  }
  
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat);
   }
  }
  return skip;
 }
 return this && pat && pat.length ? innerHighlight(this, pat.toUpperCase()) : this;
};

Node.prototype.removeHighlight = function() {
	var highlighted = this.querySelectorAll('span.search-highlight');
	for (var i=0;i< highlighted.length; i++){
		var current = highlighted[i];
		var cp = current.parentNode;
		current.parentNode.firstChild.nodeName;
		cp.replaceChild(current.firstChild, current);
		cp.normalize();
	}
	return highlighted;
}




var textSpan = function (text){
	return function(){
		var span = document.createElement('span');
		span.innerHTML = text;
		return span;
	}();
}

tokenize = function(sentence,filt) {

	var punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+   // since javascript does not
          '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+  // support POSIX character
          '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+  // classes, we'll need our
          '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+   // own version of [:punct:]
          '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
          '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
          '\\|'+ '\\}'+ '\\~'+ '\\]',
    re=new RegExp(     // tokenizer
       '\\s*'+            // discard possible leading whitespace
       '('+               // start capture group
         '\\.{3}'+            // ellipsis (must appear before punct)
       '|'+               // alternator
         '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
       '|'+               // alternator
         '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
       '|'+               // alternator
         '\\w+'+              // other words
       '|'+               // alternator
         '['+punct+']'+        // punct
       ')'                // end capture group
     );
	  var result=[];
	  var ary = sentence.split(re);
	  for(var i=0,len=ary.length;i++ < len;) {
	    var member=ary[i]||'';
	    if(filt && (typeof filt === 'Function') ? filt(member) : member) {
	      result.push(member);
	    }
	  }
	  return result;

}

var selectSentence = function(){
	textdict = {};

	var func = function(text, freqdict, lower, upper, needle){

		var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );
		var ranklist = [];
		for (var i =0 ; i < sentences.length; i++){
			var sentence = sentences[i];
			var tokens = tokenize(sentence);

			for (var j = 0; j < tokens.length; j++){
				var token = tokens[j];
				var tokenLower= token.toLowerCase();

				if (tokenLower in freqdict){

					var rk = freqdict[tokenLower];
					var item  ={};
					item.token = token;
					item.rank  = rk;
					item.sentence = i;
					item.word = j;
					ranklist.push(item);
					
				}
			}
		}
		if (lower === undefined || upper === undefined || needle === undefined){
			return ranklist.length;
		}

		ranklist.sort(function(a,b){return a.rank - b.rank});
		var wordsize = ranklist.length;
		var ranklist2 = [];
		if (! (text in textdict) ) { textdict[text] = []};
		sentenceList = textdict[text];
		for (var k=Math.floor(wordsize * lower); k < Math.floor(wordsize*upper);k++){
			var item = ranklist[k];
			if ( sentenceList.indexOf(sentences[item.sentence]) === -1 ){
				ranklist2.push(item);
			}
		}
		var wordsize2 = ranklist2.length;
		if (wordsize2 === 0){ return null;}
		var rank = Math.floor(wordsize2 * needle);
		var ret2 = ranklist2[rank];
		
		sentenceList.push(sentences[ret2.sentence]);

		return {word: ret2.token, sentence: sentences[ret2.sentence], wordIndex:ret2.word, rank: ret2.rank};
	};
	return func;
}();

createExercise = function(sentence, wordIndex, globalId){
	// for now, just extract the first sentence of the input text
	
	var textarr = tokenize(sentence);
	var missing = textarr[wordIndex];
	var input = document.createElement('input');
	input.size = missing.length;
	input.id = 'Input' + globalId;
	var li = document.createElement('li');
	var button =  document.createElement('button');
	button.innerHTML = 'answer';
	button.id = 'Button' + globalId;

	li.setAttribute('class','exerciseItem');
	li.appendChild(textSpan(textarr.slice(0,wordIndex).join(' ') + ' '));
	li.appendChild(input);
	li.appendChild(textSpan(' ' + textarr.slice(wordIndex+1).join(' ')));
	li.appendChild(button);

		$(document).on('click','#Button'+globalId, function(){
				var ans = input.value;
				if (ans === missing) {
					$(this).parent().append(textSpan('yes!'));
				}
				else{
					$(this).parent().append(textSpan('no!'));
				}
			});
	li.text = sentence;
	return li;

}


//http://jquery-howto.blogspot.com/2009/04/select-text-in-input-box-on-user-select.html
var pager = new Imtech.Pager();
main = function () {


	$("#searchBox").tokenfield({
	  autocomplete: {
	    source: ['red','blue','green','yellow','violet','brown','purple','black','white'],
	    delay: 100,
	  },
	  delimiter: '|',
	  showAutocompleteOnFocus: true
	});
	var lis = [];

	var globalId = 0;
	var freqdict = {};
	$.ajax({
		type: "GET",
		url: "resources/freq.100k",
		dataType: "text",
		success: function(data) {
			var lines = data.trim('\n').split('\n');
			for (var k = 0; k < lines.length; k++){
				var tmp = lines[k].split('\t');
				var rk = parseFloat(tmp[0]);
				if (! ( tmp[1].toLowerCase() in freqdict ) ){
					freqdict[tmp[1].toLowerCase()]=rk;
				}
			}
		}
	})

	$.ajax({
		type: "GET",
		url: "resources/DeclarationOfIndependence.txt",
		dataType: "text",
		success: function(data) {
			$("#input_text").val(data);
		}
	})


	$("#submit").click(function(){
		var nEx = parseFloat($('input#number').val().trim());
		//var level = document.getElementById("difficulty").selectedIndex;
		var level = parseFloat($("select#difficulty").val());
		var text = $('textarea#input_text').val().trim();
		var idx = 0;
		for (var cnt = 0; cnt < nEx; cnt++) { 
			globalId ++;
			idx += 1;

			var needle = Math.random();
			var selected = selectSentence(text, freqdict, level / 5, (level+1)/5, needle);		
			if (! selected){ break;}
			var wordIndex = selected.wordIndex;

			var li = createExercise(selected.sentence,wordIndex,globalId);
			lis.push(li);

		}



	$("#searchButton").click(
		function(){
			var query = $("#searchBox").val();
			var queryTerms = query.split(' ');
			var results = new Array();
			var display = false;
			
			lis.map(function(element){element.removeHighlight()});

			for (var j =0; j < lis.length; j++){
				display = false;
				for (var i = 0; i < queryTerms.length; i++){
					var q = queryTerms[i];
					if (lis[j].text.indexOf(q) > -1){

						//lis[j].style.display='block';
						lis[j].style.height = 'auto';
						lis[j].style.visibility='visible';
						lis[j].highlight(q);
						display = true;
						break;
					}
					if (! display){
						lis[j].style.height=0;
						lis[j].style.visibility='hidden';
					}
				}
			}
			pager.showPage(1);
		}
	)

	pager.paragraphsPerPage = parseFloat($('input#numEx').val());
	pager.pagingContainer = $('ol');
	pager.paragraphs = lis;
	pager.showPage(1);	
	
	})
}
$(document).ready(main);
