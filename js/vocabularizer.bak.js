/*
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
*/

var textSpan = function (text){
	return function(){
		var span = document.createElement('span');
		span.setAttribute('class','textNode');
		span.appendChild(document.createTextNode(text));
		return span;
	}();
}

findChildrenByTagName = function(obj, name){
	var ret = [];
	for (var k in obj.children){
		if (obj.children[k].className === name){
			ret.push(obj.children[k]);
		}
	}
	return ret;
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

selectSentence = function(text, freqdict, rank){
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
	if (rank === -1){
		return ranklist.length;
	}

	ranklist.sort(function(a,b){return a.rank - b.rank});

	var ret2 = ranklist[rank];

	return {word: ret2.token, sentence: sentences[ret2.sentence], wordIndex:ret2.word, rank: ret2.rank};
}


createExercise = function(sentence, wordIndex, globalId){
	// for now, just extract the first sentence of the input text
	
	var textarr = tokenize(sentence);
	var input = document.createElement('input');
	input.size = textarr[wordIndex].length;
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
	return li;
	
	/*
	var li = '<li class="exerciseItem"><input class="answer_input" size={0}>
		</input><button class="answer" onclick="clickFunc()">answer</button></li>';
	return li;
	*/
}


//http://jquery-howto.blogspot.com/2009/04/select-text-in-input-box-on-user-select.html
main = function () {
	/*
	var client = new XMLHttpRequest();
	var freqdict = {};
	client.open('POST', 'resources/freq.5k');
	client.onreadystatechange = function() {
		var lines = client.responseText.split('\n');
		for (var k in lines){
			var tmp = lines[k].split('\t');
			freqdict[tmp[0]]=parseFloat(tmp[1]);
		}
		console.log(freqdict);
	}
	client.send();
	*/
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
				freqdict[tmp[1].toLowerCase()]=rk;
			}
		}
	})
	$("#submit").click(function(){
		var nEx = parseFloat($('input#number').val().trim());
		//var level = document.getElementById("difficulty").selectedIndex;
		var level = $("select#difficulty").val();
		console.log(level);
		var text = $('textarea#input_text').val().trim();
		var numTokens = selectSentence(text, freqdict, -1);
		console.log(numTokens);
		var lowerBound = Math.floor(numTokens * level / 5);
		var interval = Math.floor(numTokens / 5) + 1;
		var idx = 0;
		for (var cnt = 0; cnt < nEx; cnt++) { 
			globalId ++;
			idx += 1;

			var rank = Math.floor(Math.random() * interval ) + lowerBound;
			console.log(rank);
			var selected = selectSentence(text, freqdict, rank);		

			var missing = selected.word;
			console.log('missing = ' + missing);
			var wordIndex = selected.wordIndex;
			var li = createExercise(selected.sentence,wordIndex,globalId);




			
			var input = li.getElementsByClassName("answer_input")[0];

			var button = li.getElementsByClassName('answer')[0];
			$("ul").append(li);

			console.log($("ul").children("li").slice(-1)[0]);
			



			$("ul").on("click", "#Button" + globalId, function(Id, miss){
					return function(){
					var ans = $("#Input" + Id).val();
					console.log(ans);
					console.log(miss);
					if (ans === miss) {
						console.log('yes!');
						$(this).parent().append(textSpan('yes!'));
						//li.appendChild(document.createTextNode("yes!"));
					}
					else{
						console.log('no!');
						//li.appendChild(document.createTextNode("no!"));
					}
				}
			}(globalId,missing))



			$("li:last").append(button);
			
		}
	})


}
$(document).ready(main);
