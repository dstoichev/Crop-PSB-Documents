#target photoshop

//#include "./include/json2.js"

(function() {
    //
    // psx.jsx
    //   This file contains a collection code extracted from other parts
    //   of xtools for use in production scripts written for Adobe.
    //
    // $Id: psx.jsx,v 1.63 2012/03/15 21:34:28 anonymous Exp $
    // Copyright: (c)2011, xbytor
    // Author: xbytor@gmail.com
    // License: http://www.opensource.org/licenses/bsd-license.php
    //
    
    //    
    // !!! Only an EXTRACT from psx.jsx !!!
    // http://ps-scripts.sourceforge.net/xtools.html
    //
    
    cTID = function(s) { return app.charIDToTypeID(s); };
    sTID = function(s) { return app.stringIDToTypeID(s); };
    
    // return an ID for whatever s might be
    xTID = function(s) {
        if (s == undefined) {
          if (!isCS() && !isCS2()) {
            try {
              Stdlib.log("undefined id detected at: " + $.stack);
            } catch (e) {
              Stdlib.log("undefined id detected");
            }
          } else {
            Stdlib.log("undefined id detected");
          }
        }
      
        if (s.constructor == Number) {
          return s;
        }
        try {
          if (s instanceof XML) {
            var k = s.nodeKind();
            if (k == 'text' || k == 'attribute') {
              s = s.toString();
            }
          }
        } catch (e) {
        }
      
        if (s.constructor == String) {
          if (s.length > 0) {
            if (s.length != 4) return sTID(s);
            try { return cTID(s); } catch (e) { return sTID(s); }
          }
        }
        Error.runtimeError(19, s);  // Bad Argument
      
        return undefined;
    };
    
    //
    // This reverses the mapping from a TypeID to something readable.
    // If PSConstants.js has been included, the string returned is even
    // more readable
    // 'map' is optional. It can be either a string ("Class") or a
    // table object from PSConstants (PSClass). Using 'map' will help
    // id2char return the most appropriate result since collisions
    // happen. For instance, cTID('Rds ') is the id for PSKey.Radius
    // and PSEnum.Reds.
    //
    // D.S. Note: Used when debugging; Ensure PSConstants.js is included before uncommenting their rows below
    //
    id2char = function(s, map) {
      if (isNaN(Number(s))){
        return '';
      }
      var v;
    
      // Use every mechanism available to map the typeID
      var lvl = $.level;
      $.level = 0;
      try {
        /*
        if (!v) {
          try { v = PSConstants.reverseNameLookup(s, map); } catch (e) {}
        }
        if (!v) {
          try { v = PSConstants.reverseSymLookup(s); } catch (e) {}
        }
        */
        if (!v) {
          try { v = app.typeIDToCharID(s); } catch (e) {}
        }
        if (!v) {
          try { v = app.typeIDToStringID(s); } catch (e) {}
        }
      } catch (e) {
      }
      $.level = lvl;
      if (!v) {
        v = Stdlib.numberToAscii(s);
      }
      return v ? v : s;
    };
    
    
    //
    // What platform are we on?
    //
    isWindows = function() { return $.os.match(/windows/i); };
    isMac = function() { return !isWindows(); };
    
    //
    // Which app are we running in?
    //
    isPhotoshop = function() { return !!app.name.match(/photoshop/i); };
    isBridge = function() { return !!app.name.match(/bridge/i); };
    
    //
    // Which CS version is this?
    //
    CSVersion = function() {
      var rev = Number(app.version.match(/^\d+/)[0]);
      return isPhotoshop() ? (rev - 7) : rev;
    };
    CSVersion._version = CSVersion();
    
    // not happy about the CS7+ definitions
    isCC2015 = function()  { return CSVersion._version == 9; };
    isCC2014 = function()  { return CSVersion._version == 8; }; 
    isCC     = function()  { return CSVersion._version == 7; }; 
    isCS7    = function()  { return CSVersion._version == 7; };
    isCS6    = function()  { return CSVersion._version == 6; };
    isCS5    = function()  { return CSVersion._version == 5; };
    isCS4    = function()  { return CSVersion._version == 4; };
    isCS3    = function()  { return CSVersion._version == 3; };
    isCS2    = function()  { return CSVersion._version == 2; };
    isCS     = function()  { return CSVersion._version == 1; };
    
    //
    // psx works as a namespace for commonly used functions
    //
    psx = function() {};
    
    //
    // Description: Should the PS locale be used to determine the
    //              decimal point or should the OS locale be used.
    //              PS uses the OS locale so scripts may not match
    //              the PS UI.
    //
    psx.USE_PS_LOCALE_FOR_DECIMAL_PT = true;
    
    // 
    // Function: determineDecimalPoint
    // Description: determine what to use for the decimal point
    // Input:  <none>
    // Return: a locale-specific decimal point
    //
    // Note: Currently there is no way to determine what decimal
    //       point is being used in the PS UI so this always returns
    //       the decimal point for the PS locale
    //
    psx.determineDecimalPoint = function() {
    //   if (psx.USE_PS_LOCALE_FOR_DECIMAL_PT) {
        psx.decimalPoint = $.decimalPoint;
    //   }
      return psx.decimalPoint;
    };
    psx.determineDecimalPoint();

    
    psxui = function() {}
    
    // XXX - Need to check to see if decimalPoint is a special RegEx character
    // that needs to be escaped. Currently, we only handle '.'
    psxui.dpREStr = (psx.decimalPoint == '.' ? "\\." : psx.decimalPoint);



    // EOF EXTRACT from psx.jsx;
    
    //
    // stdlib.js
    //   This file contains a collection of utility routines that I've
    //   written, borrowed, rewritten, and occasionally tested and
    //   documented.
    //
    //   Most of this stuff is photoshop specific. I'll break out the parts
    //   that aren't sometime in the future.
    //
    // $Id: stdlib.js,v 1.368 2015/11/18 00:51:32 anonymous Exp $
    // Copyright: (c)2015, xbytor
    // License: http://www.opensource.org/licenses/bsd-license.php
    // Contact: xbytor@gmail.com
    //
        
    //    
    // !!! Only an EXTRACT from stdlib.js !!!
    // http://ps-scripts.sourceforge.net/xtools.html
    //
    
    //
    //=============================== Stdlib =====================================
    // This is the name space for utility functions. This should probably be
    // broken up into smaller classes
    
    Stdlib = function() {};
    
    
    Stdlib.numberToAscii = function(n) {
      if (isNaN(n)) {
        return n;
      }
      var str = (String.fromCharCode(n >> 24) +
                 String.fromCharCode((n >> 16) & 0xFF) +
                 String.fromCharCode((n >> 8) & 0xFF) +
                 String.fromCharCode(n & 0xFF));
    
      return (Stdlib.isAscii(str[0]) && Stdlib.isAscii(str[1]) &&
              Stdlib.isAscii(str[2]) && Stdlib.isAscii(str[3])) ? str : n;
    };
    
    // Need to implement C-style isAscii functions
    
    Stdlib.ASCII_SPECIAL = "\r\n !\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";
    Stdlib.isSpecialChar = function(c) {
      return Stdlib.ASCII_SPECIAL.contains(c[0]);
    };
    Stdlib.isAscii = function(c) {
      return !!(c.match(/[\w\s]/) || Stdlib.isSpecialChar(c));
    };

    Stdlib.ERROR_CODE = 9001;
    Stdlib.IO_ERROR_CODE = 9002;
    
    Stdlib.IOEXCEPTIONS_ENABLED = true;
    
    //
    // throwError
    //     throw an exception where you would normally have an
    //     expression e.g.
    //        var f = File("~/start.ini");
    //        f.open("r") || Stdlib.throwError(f.error);
    //
    Stdlib.throwError = function(e) {
      throw e;
    };
    throwError = Stdlib.throwError;
    
    //
    //============================= File Utilities ===============================
    //
    
    function throwFileError(f, msg) {
      if (msg == undefined) {
        msg = '';
      }
      Error.runtimeError(Stdlib.IO_ERROR_CODE, Stdlib.fileError(f, msg));
    };
    
    Stdlib.fileError = function(f, msg) {
      return ("IOError: " + (msg || '') + " \"" + f.toUIString() + "\": " +  f.error + '.');
    };
    
    //
    // Return a File or Folder object given one of:
    //    A File or Folder Object
    //    A string literal or a String object that refers to either
    //    a File or Folder
    //
    Stdlib.convertFptr = function(fptr) {
      var f;
    
      try { if (fptr instanceof XML) fptr = fptr.toString(); } catch (e) {}
    
      if (fptr.constructor == String) {
        f = File(fptr);
    
      } else if (fptr instanceof File || fptr instanceof Folder) {
        f = fptr;
    
      } else {
        Error.runtimeError(19, "fptr");
      }
      return f;
    };
    
    Stdlib.selectFolder = function(prompt, start) {
        var folder;
      
        if (!prompt) {
          prompt = 'Select a folder';
        }
      
        if (start) {
          start = Stdlib.convertFptr(start);
          while (start && !start.exists) {
            start = start.parent;
          }
        }
      
        if (!start) {
          folder = Folder.selectDialog(prompt);
      
        } else {
          if (start instanceof File) {
            start = start.parent;
          }
      
          if (start.selectDlg) {   // for CS2+
            folder = start.selectDlg(prompt);
      
          } else {               // for CS
            var preset = Folder.current;
            if (start.exists) {
              preset = start;
            }
            folder = Folder.selectDialog(prompt, preset);
          }
        }
        return folder;
    };

    
        
    //
    // Return an item called 'name' from the specified container.
    // This works for the "magic" on PS containers like Documents.getByName(),
    // for instance. However this returns null if an index is not found instead
    // of throwing an exception.
    //
    // The 'name' argument can also be a regular expression.
    // If 'all' is set to true, it will return all matches
    //
    Stdlib.getByName = function(container, name, all) {
      // check for a bad index
      if (!name) {
        Error.runtimeError(2, "name"); // "'undefined' is an invalid name/index");
      }
    
      var matchFtn;
    
      if (name instanceof RegExp) {
        matchFtn = function(s1, re) { return s1.match(re) != null; };
      } else {
        matchFtn = function(s1, s2) { return s1 == s2;  };
      }
    
      var obj = [];
    
      for (var i = 0; i < container.length; i++) {
        if (matchFtn(container[i].name, name)) {
          if (!all) {
            return container[i];     // there can be only one!
          }
          obj.push(container[i]);    // add it to the list
        }
      }
    
      return all ? obj : undefined;
    };
    
    
    // makeActive
    // Make the object (regardless of class) the 'active' one. Currently, this
    // works for documents and layers. The one that was active before this call
    // is returned
    //
    Stdlib.makeActive = function(obj) {
      var prev = undefined;
    
      if (!obj) {
        return undefined;
      }
    
      if (obj.typename == "Document") {
        prev = app.activeDocument;
        if (obj != prev) {
          app.activeDocument = obj;
        }
      } else if (obj.typename.match(/Layer/)) {
        var doc = obj.parent;
        while (!(doc.typename == "Document") && doc) {
          doc = doc.parent;
        }
        if (!doc) {
          Error.runtimeError(19, "obj"); // "Bad Layer object specified"
        }
    
        prev = doc.activeLayer;
        if (obj != prev) { 
          var d = app.activeDocument;
          app.activeDocument = doc;
    
          try {
            doc.activeLayer = obj;
    
          } catch (e) {
            $.level = 1; debugger;
          }
          app.activeDocument = d;
        }
      }
    
      return prev;
    };

    
    //
    // via SzopeN
    // These two vars are used by wrapLC/Layer and control whether or not
    // the existing doc/layer should be restored after the call is complete
    // If these are set fo false, the specified doc/layer will remain
    // the active doc/layer
    //
    Stdlib._restoreDoc = true;
    Stdlib._restoreLayer = true;
    
    
    //
    // ScriptingListener code operates on the "active" document.
    // There are times, however, when that is _not_ what I want.
    // This wrapper will make the specified document the active
    // document for the duration of the ScriptingListener code and
    // swaps in the previous active document as needed
    //
    Stdlib.wrapLC = function(doc, ftn) {
      var ad = app.activeDocument;
      if (doc) {
        if (ad != doc) {
          app.activeDocument = doc;
        }
      } else {
        doc = ad;
      }
    
      var res = undefined;
      try {
        res = ftn(doc);
    
      } finally {
        if (Stdlib._restoreDoc) {
          if (ad && app.activeDocument != ad) {
            app.activeDocument = ad;
          }
        }
      }
    
      return res;
    };
    
    //
    // The same as wrapLC except it permits specifying a layer
    //
    Stdlib.wrapLCLayer = function(doc, layer, ftn) {
      var ad = app.activeDocument;
      if (doc) {
        if (ad != doc) {
          app.activeDocument = doc;
        }
      } else {
        doc = ad;
      }
    
      var al = doc.activeLayer;
      var alvis = al.visible;
    
      if (layer && doc.activeLayer != layer) {
        doc.activeLayer = layer;
    
      } else {
        layer = doc.activeLayer;
      }
    
      var res = undefined;
    
      try {
        res = ftn(doc, layer);
    
      } finally {
        if (Stdlib._restoreLayer) {
          if (doc.activeLayer != al) {
            try {
              doc.activeLayer = al;
            } catch (e) {
              // XXX-CC2015 Mondo bug work-around from Rune L-H
              if (app.displayDialogs == DialogModes.NO) {
                var mode = app.displayDialogs;
                app.displayDialogs = DialogModes.NO
                doc.activeLayer = al;
                app.displayDialogs = mode;
              }
            }
          }
          if (!doc.activeLayer.isBackgroundLayer) {
            doc.activeLayer.visible = alvis;
          }
        }
    
        if (Stdlib._restoreDoc) {
          if (app.activeDocument != ad) {
            app.activeDocument = ad;
          }
        }
      }
    
      return res;
    };

    
    Stdlib.getLayerDescriptor = function(doc, layer, dontWrap) {
        function _ftn() {
          var ref = new ActionReference();
          ref.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
          return executeActionGet(ref);
        };
      
        if (dontWrap) {
          Stdlib.makeActive(doc);
          Stdlib.makeActive(layer);
          return _ftn();
        } else {
          return Stdlib.wrapLCLayer(doc, layer, _ftn);
        }
    };
    
    
    Stdlib.isLayerMaskEnabled = function(doc, layer) {
        var desc = Stdlib.getLayerDescriptor(doc, layer);
        return (desc.hasKey(cTID("UsrM")) && desc.getBoolean(cTID("UsrM")));
    };
    
    // from discussions with Mike Hale
    Stdlib.hasLayerMask = function(doc, layer) {
      function _ftn() {
        var ref = new ActionReference();
        ref.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
        var desc = executeActionGet(ref);
        /*
        var keys = ''.concat('Layer ', desc.getString(cTID('Nm  ')), "\n");
        
        for (var i = 0; i < desc.count; i++)
        {
            keys = keys.concat(id2char(desc.getKey(i) ), "\n");
        }
        alert(keys);
        */
        return desc.hasKey(cTID("UsrM"));
      }
      return Stdlib.wrapLCLayer(doc, layer, _ftn);
    };
    
    Stdlib.disableLayerMask = function(doc, layer) {
        Stdlib.setLayerMaskEnabledState(doc, layer, false);
    };
    
    Stdlib.enableLayerMask = function(doc, layer) {
        Stdlib.setLayerMaskEnabledState(doc, layer, true);
    };
    
    Stdlib.setLayerMaskEnabledState = function(doc, layer, state) {
        function _ftn() {
          var desc = new ActionDescriptor();
      
          var ref = new ActionReference();
          ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
          desc.putReference(cTID('null'), ref );
      
          var tdesc = new ActionDescriptor();
          tdesc.putBoolean(cTID('UsrM'), state);
          desc.putObject(cTID('T   '), cTID('Lyr '), tdesc);
      
          executeAction(cTID('setd'), desc, DialogModes.NO );
        }
        if (state == undefined) {
          state = false;
        }
        Stdlib.wrapLCLayer(doc, layer, _ftn);
    };
    
    
    Stdlib.getSelectionBounds = function(doc) {
        function _ftn() {
      
          if (CSVersion() > 2) {
            var bnds = doc.selection.bounds;
            for (var i = 0; i < bnds.length; i++) {
              bnds[i] = bnds[i].value;
            }
            return bnds;
          }
      
          var l = doc.artLayers.add();
      
          doc.selection.fill(app.foregroundColor);
      
          var bnds = l.bounds;
          var hs = doc.historyStates;
      
          if (hs[hs.length-2].name == "Layer Order") {
            doc.activeHistoryState = hs[hs.length-4];
          } else {
            doc.activeHistoryState = hs[hs.length-3];
          }
      
          for (var i = 0; i < bnds.length; i++) {
            bnds[i] = bnds[i].value;
          }
          return bnds;
        }
      
        return Stdlib.wrapLCLayer(doc, doc.activeLayer, _ftn);
    };

    
    //============================= History  ===============================
    //
    // Thanks to Andrew Hall for the idea
    // Added named snapshot support
    //
    Stdlib.takeSnapshot = function(doc, sname) {
      function _ftn() {
        var desc = new ActionDescriptor();  // Make
    
        var sref = new ActionReference();   // Snapshot
        sref.putClass(cTID("SnpS"));
        desc.putReference(cTID("null"), sref);
    
        var fref = new ActionReference();    // Current History State
        fref.putProperty(cTID("HstS"), cTID("CrnH"));
        desc.putReference(cTID("From"), fref );
    
        if (sname) {                         // Named snapshot
          desc.putString(cTID("Nm  "), sname);
        }
    
        desc.putEnumerated(cTID("Usng"), cTID("HstS"), cTID("FllD"));
        executeAction(cTID("Mk  "), desc, DialogModes.NO );
      }
    
      Stdlib.wrapLC(doc, _ftn);
    };
    
    //
    // Revert to named snapshot
    //
    Stdlib.revertToSnapshot = function(doc, sname) {
      function _ftn() {
        if (!sname) {
          return Stdlib.revertToLastSnapshot(doc);
        }        
        var state = Stdlib.getByName(doc.historyStates, sname);        
        if (state) {
          doc.activeHistoryState = state;
          return true;
        }
        return false;
      }
      return Stdlib.wrapLC(doc, _ftn);
    };
    
    //
    // Revert to the last auto-named snapshot
    //
    Stdlib.revertToLastSnapshot = function(doc) {
      function _ftn() {
        var states = Stdlib.getByName(doc.historyStates, /^Snapshot /, true);
        if (states.length > 0) {
          doc.activeHistoryState = states.pop();
          return true;
        }
        return false;
      }
      return Stdlib.wrapLC(doc, _ftn);
    };
    
    Stdlib.deleteSnapshot = function(doc, name) {
      function _ftn() {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(cTID('SnpS'), name);
        desc.putReference(cTID('null'), ref);
        executeAction(cTID('Dlt '), desc, DialogModes.NO );
      }
      return Stdlib.wrapLC(doc, _ftn);
    
    //   function _deleteCurrent() {
    //     var ref = new ActionReference();
    //     ref.putProperty(cTID("HstS"), cTID("CrnH"));
    
    //     var desc = new ActionDescriptor();
    //     desc.putReference(cTID("null"), ref );
    //     executeAction(cTID("Dlt "), desc, DialogModes.NO );
    //   };
    
    //   var state = doc.activeHistoryState;
    //   if (!Stdlib.revertToSnapshot(doc, name)) {
    //     return false;
    //   }
    //   try {
    //     _deleteCurrent(doc, name);
    //   } finally {
    //     var level = $.level;
    //     try {
    //       $.level = 0;
    //       doc.activeHistoryState = state;
    //     } catch (e) {
    //     }
    //     $.level = level;
    //   }
    //   return true;
    };
    
    //
    // Format a Date object into a proper ISO 8601 date string
    //
    Stdlib.toISODateString = function(date, timeDesignator, dateOnly, precision) {
      if (!date) date = new Date();
      var str = '';
      if (timeDesignator == undefined) { timeDesignator = 'T'; };
      function _zeroPad(val) { return (val < 10) ? '0' + val : val; }
      if (date instanceof Date) {
        str = (date.getFullYear() + '-' +
               _zeroPad(date.getMonth()+1,2) + '-' +
               _zeroPad(date.getDate(),2));
        if (!dateOnly) {
          str += (timeDesignator +
                  _zeroPad(date.getHours(),2) + ':' +
                  _zeroPad(date.getMinutes(),2) + ':' +
                  _zeroPad(date.getSeconds(),2));
          if (precision && typeof(precision) == "number") {
            var ms = date.getMilliseconds();
            if (ms) {
              var millis = _zeroPad(ms.toString(),precision);
              var s = millis.slice(0, Math.min(precision, millis.length));
              str += "." + s;
            }
          }
        }
      }
      return str;
    };
    
    //
    // Make it a Date object method
    //
    Date.prototype.toISODateString = function(timeDesignator, dateOnly, precision) {
      return Stdlib.toISODateString(this, timeDesignator, dateOnly, precision);
    };
    Date.prototype.toISOString = Date.prototype.toISODateString;
    
    
    File.prototype.toUIString = function() {
      return decodeURI(this.fsName);
    };
    Folder.prototype.toUIString = function() {
      return decodeURI(this.fsName);
    };


    Stdlib._getPreferencesFolder = function() {
        var desktop = Folder.desktop;
      
        if (!desktop || !desktop.exists) {
          desktop = Folder("~");
        }
      
        var folder = new Folder(desktop + "/CropSaverLog");
      
        if (!folder.exists) {
          folder.create();
        }
      
        return folder;
    };
      
    Stdlib.PREFERENCES_FOLDER = Stdlib._getPreferencesFolder();
    
    //
    // Write a message out to the default log file.
    // Prefer UTF8 encoding.
    // Prefer \n line endings on OS X.
    //
    Stdlib.log = function(msg) {
      var file;
    
      if (!Stdlib.log.enabled) {
        return;
      }
    
      if (!Stdlib.log.filename) {
        return;
      }
    
    //   if (Stdlib.log.filename.endsWith(".ini")) {
    //     debugger;
    //     throw "Bad log file name";
    //   }
    
      if (!Stdlib.log.fptr) {
        file = new File(Stdlib.log.filename);
        if (Stdlib.log.append && file.exists) {
          if (!file.open("e", "TEXT", "????"))  {
            Error.runtimeError(Stdlib.IO_ERROR_CODE,
                               "Unable to open log file(1) " +
                               file + ": " + file.error);
          }
          file.seek(0, 2); // jump to the end of the file
    
        } else {
          if (!file.open("w", "TEXT", "????")) {
            if (!file.open("e", "TEXT", "????")) {
              Error.runtimeError(Stdlib.IO_ERROR_CODE,
                                 "Unable to open log file(2) " +
                                 file + ": " +  file.error);
            }
            file.seek(0, 0); // jump to the beginning of the file
          }
        }
        Stdlib.log.fptr = file;
    
      } else {
        file = Stdlib.log.fptr;
        if (!file.open("e", "TEXT", "????"))  {
          Error.runtimeError(Stdlib.IO_ERROR_CODE,
                             "Unable to open log file(3) " +
                             file + ": " + file.error);
        }
        file.seek(0, 2); // jump to the end of the file
      }
    
      if (isMac()) {
        file.lineFeed = "Unix";
      }
    
      if (Stdlib.log.encoding) {
        file.encoding = Stdlib.log.encoding;
      }
    
      if (msg) {
        msg = msg.toString();
      }
    
      if (!file.writeln(new Date().toISODateString() + " - " + msg)) {
        Error.runtimeError(Stdlib.IO_ERROR_CODE,
                           "Unable to write to log file(4) " +
                           file + ": " + file.error);
      }
    
      file.close();
    };
    Stdlib.log.filename = Stdlib.PREFERENCES_FOLDER + "/error.log";
    Stdlib.log.enabled = true;
    Stdlib.log.encoding = "UTF8";
    Stdlib.log.append = false;
    Stdlib.log.setFile = function(filename, encoding) {
      Stdlib.log.filename = filename;
      Stdlib.log.enabled = filename != undefined;
      Stdlib.log.encoding = encoding || "UTF8";
      Stdlib.log.fptr = undefined;
    };
    Stdlib.log.setFilename = Stdlib.log.setFile;
    
    //
    // Thanks to Bob Stucky for this...
    //
    Stdlib._maxMsgLen = 5000;
    Stdlib.exceptionMessage = function(e) {
      var str = '';
      var fname = (!e.fileName ? '???' : decodeURI(e.fileName));
      str += "   Message: " + e.message + '\n';
      str += "   File: " + fname + '\n';
      str += "   Line: " + (e.line || '???') + '\n';
      str += "   Error Name: " + e.name + '\n';
      str += "   Error Number: " + e.number + '\n';
    
      if (e.source) {
        var srcArray = e.source.split("\n");
        var a = e.line - 10;
        var b = e.line + 10;
        var c = e.line - 1;
        if (a < 0) {
          a = 0;
        }
        if (b > srcArray.length) {
          b = srcArray.length;
        }
        for ( var i = a; i < b; i++ ) {
          if ( i == c ) {
            str += "   Line: (" + (i + 1) + ") >> " + srcArray[i] + '\n';
          } else {
            str += "   Line: (" + (i + 1) + ")    " + srcArray[i] + '\n';
          }
        }
      }
    
      try {
        if ($.stack) {
          str += '\n' + $.stack + '\n';
        }
      } catch (e) {
      }
    
      if (str.length > Stdlib._maxMsgLen) {
        str = str.substring(0, Stdlib._maxMsgLen) + '...';
      }
    
      if (Stdlib.log.fptr) {
        str += "\nLog File: " + Stdlib.log.fptr.toUIString();
      }
    
      return str;
    };
    
    Stdlib.logException = function(e, msg, doAlert) {
      if (!Stdlib.log.enabled) {
        return;
      }
    
      if (doAlert == undefined) {
        doAlert = false;
    
        if (msg == undefined) {
          msg = '';
        } else if (isBoolean(msg)) {
          doAlert = msg;
          msg = '';
        }
      }
    
      doAlert = !!doAlert;
    
      var str = ((msg || '') + "\n" +
                 "==============Exception==============\n" +
                 Stdlib.exceptionMessage(e) +
                 "\n==============End Exception==============\n");
    
      Stdlib.log(str);
    
      if (doAlert) {
        str += ("\r\rMore information can be found in file:\r" +
                "    " + Stdlib.log.fptr.toUIString());
    
        alert(str);
      }
    };

    
    // EOF EXTRACT from stdlib.js


    // ContactSheetII.jsx
    
    //
    // ContactSheetUI - Named Function
    //
    ContactSheetUI = function ContactSheetUI(obj) {
      
    };
    
    //
    // Function: handleEnterKey
    // Description: This function eats Enter keys in edittext widgets
    //              The onChange callback is temporarily disabled so
    //              that it does not get called if the function throws
    //              up an alert which would cause another onChange
    //              event to get fired because of the loss of focus
    //  Input: event - a UI event
    //  Return: <none>
    //
    ContactSheetUI.handleEnterKey = function(event) {
      var obj = event.currentTarget;
    
      if (event.keyName == 'Enter') {
        if (obj.onChange) {
          obj._ftn = obj.onChange;
          obj.onChange = undefined;
          var res = obj._ftn();
          obj.onChange = obj._ftn;
          obj._ftn = undefined;
    
          // if the field validation failed, eat the Enter key
          if (res == false) {
            event.stopPropagation();
            event.preventDefault();
    
          } else if (res == true) {
            // if it was valid, run the script
    
          } else {
            // we didn't validate
          }
        }
      }
    };

    
    //
    // Function: addPositiveNumberFilter
    // Description: Adds a positive number/localized-decimal-point keystroke filter
    // Input:  obj - UI widget
    // Return: <none>
    //
    ContactSheetUI.addPositiveNumberFilter = function(obj) {
      obj.keyFilter = RegExp("[" + psxui.dpREStr + "\\d]");
      obj.addEventListener('keydown', ContactSheetUI.filterKey);
    };
    
    //
    // Function: filterKey
    // Description: Keystroke event filter
    // Input:  event - UI event
    // Return: <none>
    //
    ContactSheetUI.filterKey = function(event) {
      var obj = event.currentTarget;
      var filter = obj.keyFilter;
    
      var c = Number("0x" + event.keyIdentifier.substring(2));
      var key = String.fromCharCode(c);
    
      // $.writeln(event.keyName + ' : ' + key + ' : ' + filter);
    
      if (filter && key.match(filter)) {
        return;
    
      } else if (event.keyName == 'Enter') {
        ContactSheetUI.handleEnterKey(event);
    
      } else if (event.keyName.length == 1) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    
    // EOF EXTRACT from ContactSheetII.jsx
    

    
    /**
     * @param{Object} opts - passed by reference
     */
    CropSaverUi = function(opts) {
        this.bounds = "x: 200, y: 200, width: 650, height: 420";
        
        this.docNote = ''.concat("\n", 'Processes all documents currently OPEN in Photoshop.', "\n\n",
                                 'Saves an image cropped via the CROP layer ',
                                  'when this layer exists and an image AS IS when the layer is absent.');
        
        this.opts = opts;
        
        this.defaultSmallSizeOutputImageLongerSide = opts.smallSizeOutputImageLongerSide;
        
        this.title = 'Image Saving Preferences';
        
        this.preferencesWin = null;
        this.progressWin = null;
    }

    CropSaverUi.prototype = {
        browseForOutputFolder: function() {
            var def = this.opts.outputResultsDestinationPath || Folder.current;
      
            var folder = Stdlib.selectFolder("Select destination folder", def);
            if (folder) {
                this.preferencesWin.settingsPnl.outputFolderGroup.outputFolder.text = folder.fsName;
                this.opts.outputResultsDestinationPath = folder.fsName;
            }
        },
        
        closeProgress: function() {
            this.progressWin.close(0);
        },
        
        escapePath: function(path) {
            return isWindows() ? path.replace(/\\/g, '\\\\') : path;
        },
        
        prepareProgress: function() {
            var resource =
            "palette { orientation:'column', text: 'Please wait...', preferredSize: [450, 30], alignChildren: 'fill', \
                barPanel: Panel { orientation: 'row', alignment: 'left', text: 'Progress', \
                    bar: Progressbar { preferredSize: [378, 16], alignment: ['left', 'center'] \
                    }, \
                    stPercent: StaticText { alignment: ['right', 'center'], text: '  0% ', characters: 4, justify: 'right' } \
                }, \
                infoGroup: Group { orientation: 'column', alignment: 'fill', \
                                   alignChildren: 'fill', maximumSize: [1000, 40], \
                    stDoc: StaticText { text: ' ', properties: {multiline: true} }, \
                    stWarn: StaticText { text: 'Please do not make changes to current document !' } \
                }, \
                btnGrp: Group { orientation:'row', alignment: 'right', \
                    cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
                } \
            }";
            
            this.progressWin = new Window(resource);
            
            var that = this;
            this.progressWin.btnGrp.cancelBtn.onClick = function() {
                that.opts.isCancelledByClient = true;
                that.progressWin.close(-1);
            };
            
            this.progressWin.center();
            
            return this.progressWin;
        },
        
        prepareWindow: function() {
            var that = this;
            // Define the resource specification string,
            // which specifies all of the components for the 
            // Image Saving Preferences dialog.
            var resource =
            "dialog { orientation:'column', \
                text: '"+this.title+"', frameLocation:[100, 100],  \
                notePnl: Panel { orientation:'column', alignment: 'fill', maximumSize: [700, 90], margins: [15, 0, 10, 15], \
                    text: 'Note', \
                    st: StaticText { text: '', alignment: 'fill', \
                                     properties: {multiline: true} \
                    }, \
                }, \
                settingsPnl: Panel { orientation: 'column',\
                    outputFolderGroup: Group{orientation: 'row', alignment: 'left', \
                        st: StaticText { alignment: ['left', 'center'], text: 'Output folder:' }, \
                        outputFolder: EditText {characters: 41, text: '"+this.escapePath( this.opts.outputResultsDestinationPath )+"'}, \
                        outputFolderBrowseBtn: Button { text:'...', size: [25, 20], properties:{name:'selectFolder'} } \
                    }, \
                    outputTypeGroup: Group{orientation: 'row', alignment: 'left',\
                        st: StaticText { alignment: ['left', 'center'], text: 'Output format:' }, \
                        rbJpeg: RadioButton { text: 'JPEG', value: 'true' }, \
                        rbTiff: RadioButton { text: 'TIFF' } \
                    }, \
                    smallSizeGroup: Group{orientation: 'column', alignment: 'left',\
                        chb: Checkbox { text: ' Create small size images, too.', alignment: ['left', 'center'] } \
                        selectSmallerSizeGroup: Group{orientation: 'row', alignment: 'left', margins: [20, 0, 10, 0] \
                            st: StaticText { alignment: ['left', 'center'], text: 'Set long side to:' }, \
                            sizeEt: EditText { characters: 5, text: '"+this.defaultSmallSizeOutputImageLongerSide+"' }, \
                            stPx: StaticText { alignment: ['left', 'center'], text: ' px' } \
                        }, \
                    }, \
                }, \
                btnGrp: Group { orientation:'row', alignment: 'right', \
                    processBtn: Button { text:'Process', properties:{name:'ok'} }, \
                    cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
                } \
            }";
            
            // Create a window of type dialog.
            this.preferencesWin = new Window(resource);
            this.preferencesWin.notePnl.st.text = this.docNote;            
            
            var settings = this.preferencesWin.settingsPnl;
            
            // Register event listeners that define the button behavior
            settings.outputFolderGroup.outputFolderBrowseBtn.onClick = function() {
                that.browseForOutputFolder.call(that);
            };
            
            var typeGroup = settings.outputTypeGroup;
            typeGroup.rbJpeg.onClick = typeGroup.rbTiff.onClick = function() {
                var selected = 'JPEG';
                if (typeGroup.rbTiff.value) {
                    selected = 'TIFF';
                }
                that.opts.outputImageType = selected;
            };
            
            var smallSizeGroup = settings.smallSizeGroup;
            smallSizeGroup.chb.onClick = function() {
                if (smallSizeGroup.chb.value) {
                    that.opts.wantSmallSize = true;
                    smallSizeGroup.selectSmallerSizeGroup.enabled = true;
                }
                else {
                    that.opts.wantSmallSize = false;
                    smallSizeGroup.selectSmallerSizeGroup.enabled = false;
                }
            };
            
            var selectSmallerSizeGroup = smallSizeGroup.selectSmallerSizeGroup,
                sizeEditText = selectSmallerSizeGroup.sizeEt;                
                
            selectSmallerSizeGroup.enabled = false;
            
            ContactSheetUI.addPositiveNumberFilter(sizeEditText);
            
            sizeEditText.onChange = function() {
                var size = parseInt(sizeEditText.text);
                if (isNaN(size) || 0 >= size) {                    
                    size = that.defaultSmallSizeOutputImageLongerSide;
                    sizeEditText.text = size;
                    alert('A size must be a positive integer.');
                }
                that.opts.smallSizeOutputImageLongerSide = size;
            };
            
            var buttonGroup = this.preferencesWin.btnGrp;
            buttonGroup.processBtn.onClick = function() {
                that.preferencesWin.close(0);
            };
            buttonGroup.cancelBtn.onClick = function() {
                that.preferencesWin.close(2);
            };
            
            this.preferencesWin.center();
            
            return this.preferencesWin;
        },
        
        /**
         * The idea for updating the progress is from https://github.com/jwa107/Photoshop-Export-Layers-to-Files-Fast
         */
        updateProgress: function(percent, currentDoc, force) {
            var barPanel = this.progressWin.barPanel,
                infoGroup = this.progressWin.infoGroup,
                percent = parseInt(percent, 10),
                maxInfoLength = 62,
                processingInfo = '';
            
            barPanel.bar.value = percent;
            barPanel.stPercent.text = percent + '% ';
            
            if (currentDoc) {
                processingInfo = currentDoc;
                if (maxInfoLength < currentDoc.length) {
                    processingInfo = currentDoc.substring(0, maxInfoLength - 3) + '...';
                }
                infoGroup.stDoc.text = processingInfo;
            }
            
            var d = new ActionDescriptor();
            d.putEnumerated(sTID('state'), sTID('state'), sTID('redrawComplete'));
            app.executeAction(sTID('wait'), d, DialogModes.NO);
        }
    };

    
    CropSaver = function() {
        this.alertText = ''.concat('Processed documents:', "\n\n");
        this.alertTextHasWarnings = false;
        
        this.cancelledByClientMessage = 'CancelledByClient';
                
        this.cropLayerName = 'CROP';
        
        this.opts = {
            isCancelledByClient: false,
            outputResultsDestinationPath: Folder.myDocuments.fsName,
            outputImageType: 'JPEG',
            wantSmallSize: false,
            smallSizeOutputImageLongerSide: 1000
        };
        
        this.okTextlineFeed = "\n";
        
        this.outputFileExtension = '';
        this.saveOptions = null;
        
        this.ui = null;
    }
    
    CropSaver.prototype = {
        addWarningToAlertText: function(docName, msg) {
            if (-1 !== this.alertText.indexOf(docName)) {
                docName = '         ';
            }
            this.alertText = ''.concat(this.alertText, docName, ' - Warning: ', msg, this.okTextlineFeed);
            this.alertTextHasWarnings = true;
        },
        
        /**
         * Throws an Error with special message
         * or returns boolean
         *
         * @param {boolean} returnBoolean
         * @returns {boolean}
         */
        checkCancelledByClient: function(returnBoolean) {
            var result = false;
            
            if (this.opts.isCancelledByClient) {
                if (! returnBoolean) {
                    throw new Error(this.cancelledByClientMessage);
                }
                else {
                    result = true;
                }
            }
            
            return result;
        },
        
        /**
         * Copy Merged via ActionManager code
         */
        copyMerged: function() {    
            var idCpyM = charIDToTypeID( "CpyM" );
            executeAction( idCpyM, undefined, DialogModes.NO );
        },
        
        init: function() {
            var originalRulerUnits = app.preferences.rulerUnits;
            app.preferences.rulerUnits = Units.PIXELS;
                        
            try {
                this.ui = new CropSaverUi(this.opts);
                var win = this.ui.prepareWindow(),
                    result = win.show();
                
                if (2 != result) {                    
                    this.main();
                }
                
            } catch (e) {
                alert(e);
            }
            
            app.preferences.rulerUnits = originalRulerUnits;            
        },
        
        initPreferences: function() {
            if ('JPEG' === this.opts.outputImageType) {
                this.saveOptions = new JPEGSaveOptions();
                this.saveOptions.quality = 10;
                this.outputFileExtension = '.jpg';
            }
            else {
                this.saveOptions = new TiffSaveOptions();
                this.saveOptions.layers = false;
                this.saveOptions.transparency = false;
                this.saveOptions.alphaChannels = false;
                this.saveOptions.embedColorProfile = false;
                this.saveOptions.imageCompression = TIFFEncoding.TIFFLZW;
                this.saveOptions.saveImagePyramid = false;
                this.outputFileExtension = '.tiff';
            }
        },
        
        main: function() {
            this.initPreferences();
            
            var docs = app.documents,
                docsCount = docs.length,
                currentActive = app.activeDocument,                
                snapshotNameBase ='BeforeCropSaver: ',
                percentComplete = 1,
                doc, start, snapshotName, progressWin;
            
            try {
                progressWin = this.ui.prepareProgress();
                progressWin.show();
                
                for (var i = 0; i < docsCount; i++)
                {
                    doc = docs[i];
                    start = new Date();
                    snapshotName = snapshotNameBase + start.toISOString('T', false, 3);
                    
                    Stdlib.takeSnapshot(doc, snapshotName);
                    
                    this.ui.updateProgress( percentComplete, 'Processing: ' + doc.name );
                    
                    this.processDocument(doc);
                    Stdlib.revertToSnapshot(doc, snapshotName);
                    
                    percentComplete = parseInt((i + 1) * 100 / docsCount, 10);
                    this.ui.updateProgress( percentComplete );
                                                            
                    this.checkCancelledByClient();
                }
            } catch (e) {
                var msgToLog = '',
                    msgForUser = 'A problem occurred.';
                if (this.cancelledByClientMessage === e.message) {
                    msgToLog = 'Script execution was cancelled by User.';
                    msgForUser = 'You cancelled Crop Saver execution.';
                }
                this.addWarningToAlertText(doc.name, msgForUser);
                app.activeDocument = doc; // must be the correct active document before attempting revert on Mac
                Stdlib.revertToSnapshot(doc, snapshotName);
                Stdlib.logException(e, msgToLog, false);
            }
            
            this.ui.closeProgress();
            
            app.activeDocument = currentActive;
            
            if (this.alertTextHasWarnings) {
                var moreInfoFileStr = ''.concat("More information can be found in file:\n", "    ", Stdlib.log.fptr.toUIString());
                this.alertText = ''.concat(this.alertText, "\n\n", 'Some documents were not processed correctly.', "\n\n", moreInfoFileStr);
            }
            alert(this.alertText);
        },
        
        processDocument: function(doc) {
            var cropLayerRef;
                
            app.activeDocument = doc;
                
            try {
                // Clean up selection, if any
                doc.selection.deselect();
            } catch (e) {}
            
            try {
                cropLayerRef = doc.artLayers.getByName(this.cropLayerName);
                
                if (false == cropLayerRef.visible) {
                    cropLayerRef.visible = true;
                }
                
                if (Stdlib.hasLayerMask(doc, cropLayerRef)) {
                    if (!Stdlib.isLayerMaskEnabled(doc, cropLayerRef)) {                    
                        Stdlib.enableLayerMask(doc, cropLayerRef);
                    }
                    
                    this.selectJustTheCrop();                    
                }
                else {
                    // select all
                    this.selectAll(doc);
                }
                
                this.checkCancelledByClient();
            } catch(e) {                    
                if ('No such element' == e.message || '- The object "layer "CROP"" is not currently available.' == e.message) {
                    // select all
                    this.selectAll(doc);
                }
                else {
                    throw (e);
                }
            }
            
            var bounds = Stdlib.getSelectionBounds(doc),
                topLeftX = bounds[0],
                topLeftY = bounds[1],
                bottomRightX = bounds[2],
                bottomRightY = bounds[3],
                selectionWidth = bottomRightX - topLeftX,
                selectionHeight = bottomRightY - topLeftY; 
                
            if (1 < doc.layers.length) {
                this.copyMerged();
            }
            else {
                doc.selection.copy();
            }
            
            this.checkCancelledByClient();
            
            if (this.saveResult(doc, selectionWidth, selectionHeight)) {
                this.alertText = ''.concat(this.alertText, doc.name, ' - OK.', this.okTextlineFeed);
            }
        },
        
        /**
         * Save the contents of the clipboard to an image file
         *
         * @param {Document} doc
         * @param {Number} tempDocWidthAsNumber
         * @param {Number} tempDocHeightAsNumber
         * @returns {boolean}
         */
        saveResult: function(doc, tempDocWidthAsNumber, tempDocHeightAsNumber) {
            var result = true,
                saveName = doc.name.split('.')[0],
                now = new Date(),
                tempDocumentName = ''.concat('Temp-', saveName, '-', now.valueOf()),
                file = new File(this.opts.outputResultsDestinationPath + '/' + saveName + this.outputFileExtension),
                currentActive;
                
            // Add temporary document
            app.documents.add(tempDocWidthAsNumber, tempDocHeightAsNumber, 72, tempDocumentName, NewDocumentMode.RGB);
            currentActive = app.documents.getByName(tempDocumentName); // TODO: do we need this
            currentActive.paste();    
            currentActive.flatten();
            
            if (this.checkCancelledByClient(true)) {
                currentActive.close(SaveOptions.DONOTSAVECHANGES);
                app.activeDocument = doc;
                throw new Error(this.cancelledByClientMessage);
            }
            
            try {
                currentActive.saveAs(file, this.saveOptions, true, Extension.LOWERCASE);
            } catch (e) {
                var warnText = 'Failed to save main output image',
                    msg = ''.concat('File save error: ', e.message, "\n", warnText, ': ', file.toUIString(), "\n");
                
                this.addWarningToAlertText(doc.name, warnText + '.');
                Stdlib.logException(e, msg, false);
                result = false;
            }
            
            if (this.opts.wantSmallSize) {
                if (! this.saveSmall(currentActive, saveName)) {
                    result = false;
                }
            }
            
            // Close the temporary document
            currentActive.close(SaveOptions.DONOTSAVECHANGES);
            
            app.activeDocument = doc; // must be the correct active document before attempting revert on Mac
            
            return result;
        },
        
        /**
         * Resize so that longer side is this.opts.smallSizeOutputImageLongerSide px
         * The idea for resizing is from xbytor's xtools ResizeImage.resize
         * Check http://ps-scripts.sourceforge.net/xtools.html
         * License: http://www.opensource.org/licenses/bsd-license.php
         *
         * @param {Document} doc
         * @param {String} saveName
         * @returns {boolean}
         */
        saveSmall: function(doc, saveName) {
            var result = true,
                maxSize = this.opts.smallSizeOutputImageLongerSide,
                width = parseInt(doc.width),
                height = parseInt(doc.height),
                outputName, file, method, resolution;
                
            if (width > height) {
                outputName = ''.concat(saveName, '_width_', maxSize, 'px', this.outputFileExtension);
                method = (maxSize > width) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(maxSize, null, resolution, method);
            }
            else {
                outputName = ''.concat(saveName, '_height_', maxSize, 'px', this.outputFileExtension);
                method = (maxSize > height) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(null, maxSize, resolution, method);
            }
            
            file = new File(this.opts.outputResultsDestinationPath + '/' + outputName);
            
            try {
                doc.saveAs(file, this.saveOptions, true, Extension.LOWERCASE);
            } catch (e) {
                var warnText = 'Failed to save small output image',
                    msg = ''.concat('File save error: ', e.message, "\n", warnText, ': ', file.toUIString(), "\n");
                
                this.addWarningToAlertText(saveName, warnText + '.');
                Stdlib.logException(e, msg, false);
                result = false;
            }
            
            return result;
        },
        
        selectAll: function(doc) {
            doc.selection.selectAll();
        },
        
        /**
         * Via ActionManager code
         * Select the entire layer then subtract the mask from the selection
         */
        selectJustTheCrop: function() {
            var idnull = charIDToTypeID( "null" ),
                idOrdn = charIDToTypeID( "Ordn" ),
                idChnl = charIDToTypeID( "Chnl" ),
                idfsel = charIDToTypeID( "fsel" ),
                idslct = charIDToTypeID( "slct" ),
                idMkVs = charIDToTypeID( "MkVs" );
            
            // Make the layer active    
            var desc1 = new ActionDescriptor(),
                ref1 = new ActionReference(),
                idLyr = charIDToTypeID( "Lyr " );
                
                
            ref1.putName( idLyr, this.cropLayerName );
            desc1.putReference( idnull, ref1 );
            desc1.putBoolean( idMkVs, false );
            executeAction( idslct, desc1, DialogModes.NO );
        
            // Select the entire layer    
            var desc2 = new ActionDescriptor(),
                ref2 = new ActionReference(),
                idsetd = charIDToTypeID( "setd" ),
                idT = charIDToTypeID( "T   " ),
                idAl = charIDToTypeID( "Al  " );
                
            ref2.putProperty( idChnl, idfsel );
            desc2.putReference( idnull, ref2 );    
            desc2.putEnumerated( idT, idOrdn, idAl );
            executeAction( idsetd, desc2, DialogModes.NO );
        
            // Make the mask active
            var desc3 = new ActionDescriptor(),
                ref3 = new ActionReference(),        
                idMsk = charIDToTypeID( "Msk " );
            
            ref3.putEnumerated( idChnl, idChnl, idMsk );
            desc3.putReference( idnull, ref3 );    
            desc3.putBoolean( idMkVs, false );
            executeAction( idslct, desc3, DialogModes.NO );
        
            // Substract the mask from the selection
            var desc4 = new ActionDescriptor(),
                ref4 = new ActionReference(),
                ref5 = new ActionReference(),
                idSbtr = charIDToTypeID( "Sbtr" ),
                idTrgt = charIDToTypeID( "Trgt" ),
                idFrom = charIDToTypeID( "From" ),
                idVrsn = charIDToTypeID( "Vrsn" ),
                idmaskParameters = stringIDToTypeID( "maskParameters" );
            
            ref4.putEnumerated( idChnl, idOrdn, idTrgt );
            desc4.putReference( idnull, ref4 );
                    
            ref5.putProperty( idChnl, idfsel );
            desc4.putReference( idFrom, ref5 );
            
            desc4.putInteger( idVrsn, 1 );
            
            desc4.putBoolean( idmaskParameters, true );
            executeAction( idSbtr, desc4, DialogModes.NO );
        }
    };
    
    
    
    if (documents.length) {
        var cs = new CropSaver();
        cs.init();
    }
    else {
        alert("Open one or more documents before running this script.");
    }
})(); // Immediately-Invoked Function Expression (IIFE)