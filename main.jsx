#include "./include/json2.js"

var savePath = '~/PS Dev/Action Target',
    cropLayerName = 'CROP';

function main()
{
    var docs = app.documents,
        alertText = ''.concat('Processed documents:', "\n"),
        doc, cropLayerReference;
        
    for (var i = 0; i < docs.length; i++)
    {
        doc = docs[i];
        app.activeDocument = doc;
        
        try {
            doc.selection.clear();
        } catch (e) {
         
        }
        
        selectJustTheCrop();
        
        var bounds = getSelectionBounds(doc),
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
        
        doc.selection.select(region, SelectionType.REPLACE);
        
        myCopyMerged();
        
        doc.selection.deselect();
  
        alertText = ''.concat(alertText, doc.name, "\n");
        saveJpeg(doc, selectionWidth, selectionHeight);
    }
    
    alert(alertText);    
}

//
// Function: getSelectionBounds
// Description: Get the bounds of the current selection
// Input:  doc  - a Document
// Return: a bound rectangle (in pixels)
//
function getSelectionBounds(doc) {
  var bnds = [];
  var sbnds = doc.selection.bounds;
  for (var i = 0; i < sbnds.length; i++) {
    bnds[i] = sbnds[i].as("px");
  }
  return bnds;
}

function myCopyMerged()
{    
    // Copy Merged
    var idCpyM = charIDToTypeID( "CpyM" );
    executeAction( idCpyM, undefined, DialogModes.NO );
}

function selectJustTheCrop()
{
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
        
        
    ref1.putName( idLyr, cropLayerName );
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

function saveJpeg(doc, tempDocWidthAsNumber, tempDocHeightAsNumber)
{
    var currentActive = app.activeDocument,
        saveName = doc.name.split('.')[0],
        tempDocumentName = 'Temp-' + saveName,
        file = new File(savePath + '/' + saveName + '.jpg'),
        opts = new JPEGSaveOptions(),
        tempDocWidth = new UnitValue(tempDocWidthAsNumber, 'px'),
        tempDocHeight = new UnitValue(tempDocHeightAsNumber, 'px');
        
    opts.quality = 10;
    
    app.documents.add(tempDocWidth, tempDocHeight, 72, tempDocumentName, NewDocumentMode.RGB);
    currentActive = app.documents.getByName(tempDocumentName);
    currentActive.paste();    
    currentActive.flatten();
    currentActive.saveAs(file, opts, true, Extension.LOWERCASE);
    currentActive.close(SaveOptions.DONOTSAVECHANGES)
}

main();