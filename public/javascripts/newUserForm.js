$(document).ready(init)

function init() {
	// Add event listeners to buttons
	$('button', '#role-selector').on('click', function(e) {
		if (e) e.preventDefault()

		$(this).siblings().each(function(idx) {
			$(this).removeClass('btn-primary')
			$(this).addClass('btn-secondary')
		})

		$(this).toggleClass('btn-secondary')
		$(this).toggleClass('btn-primary')

	})

	$('#userRegistration').submit(function (event) {
		event.preventDefault();

		// Validation
		let validationRules = [
			{
				fields: [
					'contact_info.user_email', 'contact_info.user_name.user_first',
					'contact_info.user_name.user_last', 'contact_info.user_dob.dob_date',
					'contact_info.user_address.u_line1', 'contact_info.user_address.u_city',
					'contact_info.user_address.u_zip', 'contact_info.user_emergency.uec_name',
					'contact_info.user_emergency.uec_phone'
				],
				rule: function (d) { return d && d.length > 0 ? true : false },
				message: 'Some required fields are not complete'
			},
			{
				fields: [ 'password' ],
				rule: function(d) { return d === $('[name="password-confirm"]').val() },
				message: 'Password fields must match'
			}
		]

		let validationResult = validateFormData($(this), validationRules)
		if (validationResult === false) return

		let jsonToSend = getFormData($(this));

		jsonToSend.user_created = new Date().getTime()

		let selectedRole = $('.btn-primary', '#role-selector')
		if (selectedRole.length > 0) { jsonToSend.user_role = selectedRole[0].value }


		// jsonToSend = JSON.parse(jsonToSend);
		//TEST CODE!!!!
		//jsonToSend.user_role = "VET";
		//jsonToSend.user_role = "SITE";
		// jsonToSend.user_role = "ADMIN";
		// jsonToSend.local = {
			// email: 'passport@passport',
			// password: 'password123'
		// };
		//end TEST CODE
		jsonToSend = JSON.stringify(jsonToSend);
		console.log(jsonToSend);
		//post to database
		var posting = $.ajax({
			type : 'POST',
			url : "/user/register",
			dataType : 'json',
			contentType : 'application/json; charset=UTF-8',
			data : jsonToSend
		});

		//check for error
		posting.done(function (xhr) {
			if(xhr.status == 200) {
				// TODO: Clear form data
				// Display notif that user has been created
			}
			else {
				console.log("Error Occured");
			}
		});

		posting.fail(function (data) {
			console.log("Data not saved");
		});
	});

  function getFormData(form) {
    let formData = {}
    let inputFields = $('input', form)
    inputFields.each(function(idx) {
			let objectType = this.type
      let objectPath = this.name
      let objectPieces = objectPath.split('.')
      let currentObjectPlace = formData
      objectPieces.forEach((p, i) => {
        if (i < (objectPieces.length-1)) {
          if (!currentObjectPlace[p]) currentObjectPlace[p] = {}
          currentObjectPlace = currentObjectPlace[p]
        } else {
					if (this.type === 'date') {
						currentObjectPlace[p] = new Date(this.value)
					} else if (this.type === 'checkbox') {
						currentObjectPlace[p] = this.checked
					} else {
						currentObjectPlace[p] = this.value
					}
        }
      })
    })

    return formData
  }

	function getFormJsonString(form) {
		return JSON.stringify(getFormData(form))
	}

	function validateFormData(form, rules) {
		let formValid = true
		let formErrors = []

		// Clear previous form errors
		$('.form_errors', form).empty()
		$('.has-danger', form).each(function(idx) {
			$(this).removeClass('has-danger')
		})

		rules.forEach((rule) => {
			let ruleFailed = false
			rule.fields.forEach((f) => {
				let field = $('[name="'+f+'"]', form)
				if (field.length < 1) {
					console.error('Unable to find and validate field "' + f + '"')
					return
				}

				let fieldValue = field.val()

				// If rule fails...
				if (rule.rule(fieldValue) === false) {
					// Form is not valid
					formValid = false

					// Set the style of the form groups
					let container = field
					while (!container.hasClass('form-group')) {
						if (!container[0]) debugger
						container = $(container[0].parentNode)
					}
					container.addClass('has-danger')

					// Only add rule message if the rule hasn't failed yet
					if (ruleFailed === false) {
						formErrors.push(rule.message)
						ruleFailed = true
					}
				}
			})
		})

		// If form errors, add them
		if (formErrors.length > 0) {
			let errorList = $('.form_errors', form)
			errorList.append(
				'<div class="alert alert-danger" role="alert"><h5>There were problems '
				+ 'submitting this form:</h5><ul></ul></div>'
			)

			errorList = $('ul', errorList)
			formErrors.forEach((err) => {	errorList.append('<li>' + err + '</li>') })
		}

		return formValid
	}

	function clearFormData(form) {
		let inputFields = $('input', form)
    inputFields.each(function(idx) {
			if (this.type === 'checkbox') { this.checked = false }
			else { this.value = '' }
		})

		$('.btn-primary', '#role-selector')
		.toggleClass('btn-primary')
		.toggleClass('btn-secondary')
	}

}
