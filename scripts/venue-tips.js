ko.components.register('venue-tips-template', {
	viewModel: function (params) {
		this.prefix = params.value.prefix;
		this.suffix = params.value.suffix;
		this.firstName = params.value.firstName;
		this.lastName = params.value.lastName;
		this.src = ko.computed(function(){
			if(this.prefix !== "" && this.suffix !== ""){
				return params.value.prefix + "100x100" + params.value.suffix;
			}
		});
		this.fullName = ko.computed(function(){
			if(this.firstName !== "" && this.firstName !== ""){
				return params.value.firstName + " " + params.value.lastName;
			}
		});
		this.review = params.value.review;
	},
	template: { element: 'venue-template'}
});
