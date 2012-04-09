enyo.kind({
  name: "HslLocks.Main",
  components: [
    {kind: "onyx.Popup", name: "scrim", autoDismiss: false, modal: true, centered: true,
     components: [
      {tag: "h1", content: "Please Wait"}
    ]},
    {kind: "HslLocks.LoginPopup", name: "loginPopup", onLoginChanged: "loadLoginData"},
    {kind: "FittableRows", components: [
      {kind: "HslLocks.Buttons", onclick: "lockGroupClick", name: "lockGroup"},
      {kind: "HslLocks.PamelaStatus" },
      {kind: "onyx.Button", content: "Login", onclick: "showPopup" }
    ]}
  ],

  create: function() {
    this.inherited(arguments);

    this.loadLoginData();

    this.getCurrentStatus();

    // Blocking timer to prevent people from busting the server jamming on
    // buttons
    this.jamLock = true;

    // This refreshes the screen every 30 seconds
    setTimeout( "hsllock.getCurrentStatus()", 30000);

    // In webOS this makes the loading screen go away
    if( window.PalmSystem ) {
      window.PalmSystem.stageReady();
    }
  },

  loadLoginData: function() {
    // Pull login data from HTML5 localStorage, open the popup if it doesn't
    // exist.
    loginData = localStorage.getItem("hsllock_loginData")
    if( loginData) {
      loginData = loginData.split("|");
      this.username = loginData[0];
      this.password = loginData[1];
      this.url      = loginData[2] ? loginData[2] : "http://intranet.heatsynclabs.org/~access/cgi-bin/access.rb";
    } else {
      this.$.loginPopup.show();
    }

    this.getCurrentStatus();
  },

  /*
   * This function handles updating the UI based on the currentStatus
   */
  updateColor: function() {
    var color;
    if(this.currentStatus == "1"){
      this.$.lockGroup.locked();
      color = "red";
    } else {
      this.$.lockGroup.unlocked();
      color = "green";
    }
    document.body.style.backgroundColor = color;
  },

  getCurrentStatus: function() {
    // FIXME: Move this to create somehow
    this.lockAjaxEndpoint = new enyo.Ajax({ url: this.url});
    this.lockAjaxEndpoint.handleAs = "text";

    // FIXME BUG: This is cleared after every successful get
    this.lockAjaxEndpoint.response(this, "getStatusCompleted");

    this.lockAjaxEndpoint.go({user: this.username, pass: this.password, cmd: "status"});
  },

  getStatusCompleted: function(inRequest, inResponse) {
    if( inResponse.match(/State/g) ) {
      // Turn the last character in to a status
      lockStatus = /Unlocked.*([0-1])/g.exec( inResponse )[1];

      if(lockStatus.length > 0) {
        this.currentStatus = lockStatus;
        this.updateColor();
      }
    }

    this.jamLock = true;
    this.updateColor();

    // reset the timer
    setTimeout("hsllock.getCurrentStatus()", 30000);
    this.$.scrim.hide();
  },

  lockGroupClick: function(inSender, e) {
    if(this.jamLock) {
      this.$.scrim.show();
      this.currentStatus = this.$.lockGroup.value;
      this.lockAjaxEndpoint.go({user: this.username, pass: this.password, cmd: this.$.lockGroup.value});
      this.jamLock = false;

      // This is a band-aid, yay band-aids
      // Basically, there's a delay between when OAC unlocks and when it 
      // admits it's unlocked. This will help make that less noticeable.
      setTimeout("hsllock.getCurrentStatus()", 10000);
    }
  },

  showPopup: function() {
    this.$.loginPopup.show();
  }
});
