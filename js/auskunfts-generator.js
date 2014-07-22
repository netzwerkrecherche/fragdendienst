var doc;
var addr = {
	  name: ''
	, street: ''
	, city: ''
	, zipcode: ''
	, birthdate: ''
	, birthplace: ''
}

function generateLetters() {
	var receivers = [];
	$("input[name='agencies[]']:checked").each(function() {
		receivers.push( agencies[$(this).val()] );
	});

	if (receivers.length === 0) {
		alert('Sie haben kein Amt ausgewählt.');
		return;
	}

	var cnt = 0;
	for (var r in receivers) {
		generateLetter(receivers[r], cnt++);
	}
}

function generateLetter(receiver, cnt) {
	// letter layout according to http://upload.wikimedia.org/wikipedia/commons/6/64/DIN_5008%2C_Form_A.svg
	if (cnt === 0) 
		doc = new jsPDF('p', 'mm', 'a4');
	else 
		doc.addPage();

	if (typeof doc == 'undefined') 
		alert('Error within PDF generation. Your browser does not seem to support this operation. If possible, please try another one.')

	// folding marks 
	doc.setLineWidth(0.5);
	doc.line(0, 87, 10, 87);
	doc.setLineWidth(0.5);
	doc.line(0, 148.5, 10, 148.5);

	addr.name = $("#addr_name").val() || 'Max Mustermann';
	addr.street = $("#addr_street").val() || 'Musterstr. 1';
	addr.zipcode = $("#addr_zipcode").val() || '12345';
	addr.city = $("#addr_city").val() || 'Musterstadt';
	addr.birthdate = $("#addr_birthdate").val() || '01.01.1970';
	addr.birthplace = $("#addr_birthplace").val() || 'Musterstadt';
	var send_back_to = [addr.name, addr.street, addr.zipcode + " " + addr.city].join(', ');
	var lines_send_back_to = doc.splitTextToSize(send_back_to, 80);

	doc.setFontSize(9);
	doc.text(25, 27, lines_send_back_to);

	doc.setFontSize(10);
	var now = new Date();
	var birthdate = "Geboren am " + addr.birthdate + ", in " + addr.birthplace;
	var sender = [addr.name, addr.street, addr.zipcode + " " + addr.city, birthdate].join(crlf);
	var lines_sender = doc.splitTextToSize(sender, 75)
	doc.text(125, 32, lines_sender);

	var date = now.getDate() + "." + (now.getMonth()+1) + "." + now.getFullYear();
	doc.text(165, 92, date);

	var rcvr = receiver.title + crlf;

	if (receiver.subtitle)
		rcvr += receiver.subtitle + crlf;

	if (receiver.street)
		rcvr += receiver.street + crlf;

	rcvr +=
		+ receiver.zipcode + " " + receiver.city + crlf
		+ receiver.country + crlf;

	if (receiver.fax)
		rcvr += crlf + "Fax: " + receiver.fax;

	var lines_rcvr = doc.splitTextToSize(rcvr, 80)
	doc.text(25, 44.7, lines_rcvr);

	var body = texts[ receiver.text ].replace("$rechtsgrundlage$", receiver.law);

	var attachment = "";
	if (receiver.text === 1 || receiver.text === 2) 
		attachment = crlf + crlf + crlf + crlf + "Anhang: Personalausweiskopie";

	var txt = 'Betreff: Antrag auf Aktenauskunft' + crlf  + crlf + crlf + body + crlf
			+ crlf + addr.name + attachment;
	var lines = doc.splitTextToSize(txt, 155)
	doc.text(25, 95.46, lines)

	/*
	if (photo) {
		doc.addPage();
		doc.addImage(photo, 'JPEG', 15, 40, 180, 160);
	}
	*/
}

function updatePane() {
	generateLetters();

	if (typeof doc !== 'undefined') {
		var string = doc.output('datauristring');
		$('.preview-pane').show();
		$('.preview-pane').attr('src', string);
	}
}

function savePDF() {
	generateLetters();
	doc.save('anschreiben.pdf');
}

$(function() {
	for (var a in agencies) {
		var agency = agencies[a];
		var checked = '';

		if (a === "Bundesamt VS")
			checked ='checked="checked"';

		var html = '\
			<div class="form-group col-lg-6" style="margin-bottom:5px;">\
				<div class="checkbox">\
					<label>\
						<input ' + checked + ' name="agencies[]" value="' + a + '" type="checkbox"> ' + agency.desc + '\
					</label>\
				</div>\
			</div>\
		';
		$("#agencies").append(html);
	}

	//document.getElementById('passport_photo').addEventListener('change', getPhoto, false);
});

/*
// photo upload function is commented out, jsPDF only supports embedding JPEGs so far
var photo;
function getPhoto(evt) {
	var file = evt.target.files[0];
	var reader = new FileReader();

	//if (!file.type.match('image.')) {
		//return;
	//}

	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			photo = e.target.result;
			//updatePane();
		};
	})(file);

	reader.readAsDataURL(file)
}
*/
