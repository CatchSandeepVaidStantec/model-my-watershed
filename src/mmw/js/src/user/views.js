"use strict";

var _ = require('underscore'),
    $ = require('jquery'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    models = require('./models'),
    loginModalTmpl = require('./templates/loginModal.ejs');

var ENTER_KEYCODE = 13;

var LoginModalView = Marionette.ItemView.extend({
    template: loginModalTmpl,

    ui: {
        'signIn': '#sign-in',
        'continueAsGuest': '#continue-as-guest',
        // The id names come from the default Django login form
        'username': '#id_username',
        'password': '#id_password'
    },

    events: {
        'click @ui.signIn': 'validate',
        'click @ui.continueAsGuest': 'continueAsGuest',
        'keyup': 'handleKeyUpEvent'
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },

    handleKeyUpEvent: function(e) {
        if (e.keyCode === ENTER_KEYCODE) {
            this.validate();
        }
    },

    setFields: function() {
        this.model.set({
            username: $(this.ui.username.selector).val(),
            password: $(this.ui.password.selector).val()
        }, { silent: true });
    },

    validate: function() {
        this.setFields();

        var errors = this.model.validate(this.model.attributes);

        if (errors) {
            return;
        } else {
            this.signIn();
        }
    },

    signIn: function() {
        var crsftoken = this.getCookie('csrftoken'),
            formData = this.$el.find('form').serialize();

        App.user.fetch({
            method: 'POST',
            data: formData,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', crsftoken);
            }
        })
        .done(_.bind(this.handleSignInSuccess, this))
        .fail(_.bind(this.handleSignInFail, this));
    },

    continueAsGuest: function() {
        App.user.set('guest', true);
    },

    handleSignInSuccess: function() {
        this.$el.modal('hide');

        // TODO: Temporary. For demo purposes only.
        // This should be handled in a view for the header
        $('.main li a:last').text(App.user.get('username'));
    },

    handleSignInFail: function() {
        this.model.set('signInError', true);
    },

    // TODO: Move this to a general helpers file if it's needed elsewhere
    // Source: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    getCookie: function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }

        return cookieValue;
    }
});

module.exports = {
    LoginModalView: LoginModalView
};
