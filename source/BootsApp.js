enyo.kind({
  name: "BootsApp.Main",
  components: [
    {kind: "FittableRows", components: [
      {kind: "onyx.Button", content: "Login", onclick: "showPopup" }
    ]}
  ],

  create: function() {
    this.inherited(arguments);

    // In webOS this makes the loading screen go away
    if( window.PalmSystem ) {
      window.PalmSystem.stageReady();
    }
  }

});
