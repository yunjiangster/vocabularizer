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


createExercise = function(textarr){
	// for now, just extract the first sentence of the input text


	var input = document.createElement('input');
	input.size = textarr[0].length;
	input.setAttribute('class','answer_input');
	var li = document.createElement('li');
	var button =  document.createElement('button');
	button.innerHTML = 'answer';
	button.setAttribute('class','answer');
	li.setAttribute('class','exerciseItem');
	li.appendChild(input);
	li.appendChild(textSpan(' ' + textarr.slice(1).join(' ')));
	li.appendChild(button);
	return li;
}
//http://jquery-howto.blogspot.com/2009/04/select-text-in-input-box-on-user-select.html
main = function () {
	$("#submit").click(function(){

		var textarr = $('textarea#input_text').val().trim().match( /[^\.!\?]+[\.!\?]+/g )[0].split(' ');
		var missing = textarr[0];
		var li = createExercise(textarr);
		var input = li.getElementsByClassName("answer_input")[0];

		var button = li.getElementsByClassName('answer')[0];
		$("ul").append(li);

		console.log($("ul").children("li").slice(-1)[0]);

		$("ul").children("li").slice(-1).on("click", ".answer", function(){
			console.log('?');

			var ans = input.value;
			console.log(ans);
			console.log(missing);
			if (ans === missing) {
				console.log('yes!');
				$(this).parent().append(textSpan('yes!'));
				//li.appendChild(document.createTextNode("yes!"));
			}
			else{
				console.log('no!');
				//li.appendChild(document.createTextNode("no!"));
			}
		})


		$("li:last").append(button);

	})


}
$(document).ready(main);
