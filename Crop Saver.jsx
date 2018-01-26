#target photoshop

#include "./include/json2.js"

(function() {
    function CropSaver() {
        this.savePath = '~/PS Dev/Action Target';
        
        this.cropLayerName = 'CROP';
    }
    
    CropSaver.prototype = {
        /**
         * Copy Merged via ActionManager code
         */
        copyMerged: function() {    
            var idCpyM = charIDToTypeID( "CpyM" );
            executeAction( idCpyM, undefined, DialogModes.NO );
        },
        
        /**
         * Get the bounds of the current selection
         *
         * @param {Document} doc
         * @returns {Array} A bound rectangle (in pixels)
         */
        getSelectionBounds: function(doc) {
            var result = [],
                selectionBounds = doc.selection.bounds;
                
            for (var i = 0; i < selectionBounds.length; i++) {
              result[i] = selectionBounds[i].as("px");
            }
            return result;
        },
        
        init: function() {
            var originalRulerUnits = app.preferences.rulerUnits;
            app.preferences.rulerUnits = Units.PIXELS;
                        
            try {
                this.main();
            } catch (e) {
                alert(e);
            }
            
            app.preferences.rulerUnits = originalRulerUnits;            
        },
        
        main: function() {
            var docs = app.documents,
                alertText = ''.concat('Processed documents:', "\n"),
                currentlyActive = app.activeDocument,
                doc, cropLayerRef;
                
            for (var i = 0; i < docs.length; i++)
            {
                doc = docs[i];
                
                try {
                    cropLayerRef = currentlyActive.artLayers.getByName(this.cropLayerName);
                } catch(e) {
                    if ('No such element' == e.message) {
                        alertText = ''.concat(alertText, doc.name, " - Warning: The 'CROP' layer is missing." "\n");
                        continue;
                    }
                    else {
                        throw (e);
                    }
                }
                
                app.activeDocument = doc;
                
                try {
                    // Clean up selection, if any
                    doc.selection.clear();
                } catch (e) {
                 
                }
                
                this.selectJustTheCrop();
                
                var bounds = this.getSelectionBounds(doc),
                    topLeftX = bounds[0],
                    topLeftY = bounds[1],
                    bottomRightX = bounds[2],
                    bottomRightY = bounds[3],
                    selectionWidth = bottomRightX - topLeftX,
                    selectionHeight = bottomRightY - topLeftY,
                    region = new Array(new Array( topLeftX, topLeftY ),
                                       new Array( topLeftX + selectionWidth, topLeftY ),
                                       new Array( topLeftX + selectionWidth, topLeftY + selectionHeight ),
                                       new Array( topLeftX, topLeftY + selectionHeight ));
                
                doc.selection.select(region, SelectionType.REPLACE); // TODO: do we need this
                
                this.copyMerged();
                
                doc.selection.deselect();
          
                alertText = ''.concat(alertText, doc.name, "\n");
                this.saveResult(doc, selectionWidth, selectionHeight);
            }
            
            alert(alertText);
        },
        
        /**
         * Save the contents of the clipboard to an image file
         *
         * @param {Document}
         * @param {Number} tempDocWidthAsNumber
         * @param {Number} tempDocHeightAsNumber
         */
        saveResult: function(doc, tempDocWidthAsNumber, tempDocHeightAsNumber) {
            var currentActive = app.activeDocument,
                saveName = doc.name.split('.')[0],
                tempDocumentName = 'Temp-' + saveName,
                file = new File(this.savePath + '/' + saveName + '.jpg'),
                opts = new JPEGSaveOptions(),
                tempDocWidth = new UnitValue(tempDocWidthAsNumber, 'px'),
                tempDocHeight = new UnitValue(tempDocHeightAsNumber, 'px');
                
            opts.quality = 10;
            
            // Add temporary document
            app.documents.add(tempDocWidth, tempDocHeight, 72, tempDocumentName, NewDocumentMode.RGB);
            currentActive = app.documents.getByName(tempDocumentName); // TODO: do we need this
            currentActive.paste();    
            currentActive.flatten();
            currentActive.saveAs(file, opts, true, Extension.LOWERCASE);
            
            // Close the temporary document
            currentActive.close(SaveOptions.DONOTSAVECHANGES)
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
    
    var cs = new CropSaver();
    
    if (documents.length) {
        /*
         suspendHistory(historyString, CropSavertring)
         
        Provides a single entry in history states for the entire script provided by CropSavertring .
        Allows a single undo for all actions taken in the script.
        The historyString parameter provides the string to use for the history state.
        The CropSavertring parameter provides a string of JavaScript code to
        excute while history is suspended.
        */
        app.activeDocument.suspendHistory("Crop Saver", "cs.init()");        
    }
    else {
        alert("Open one or more documents before running this script.");
    }
})(); // Immediately-Invoked Function Expression (IIFE)