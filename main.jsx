#include "./include/json2.js"

var savePath = '~/PS Dev/Action Target',
    cropLayerName = 'CROP';

function main()
{
    var docs = app.documents,
        alertText = ''.concat('Current open documents', "\n"),
        doc, cropLayerReference;
        
    for (var i = 0; i < docs.length; i++)
    {
        doc = docs[i];
        app.activeDocument = doc;
        
        try {
            doc.selection.clear();
        } catch (e) {
         
        }
        
//        cropLayerReference = doc.artLayers.getByName(cropLayerName);
  //      doc.activeLayer = cropLayerReference;
        
    //    doc.selection.selectAll();
        
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
                               new Array( topLeftX + selectionWidth, topLeftY +selectionHeight ),
                               new Array( bottomRightX, bottomRightY ));
        
        doc.selection.select(region, SelectionType.REPLACE);
        
        doc.selection.copy(true);
  
        alertText = ''.concat(alertText, JSON.stringify(bounds),  "\n");
        alertText = ''.concat(alertText, doc.name, "\n\n");
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

function selectJustTheCrop()
{
   // =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc6 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref3 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref3.putName( idLyr, cropLayerName );
    desc6.putReference( idnull, ref3 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc6.putBoolean( idMkVs, false );
executeAction( idslct, desc6, DialogModes.NO );

// =======================================================
var idsetd = charIDToTypeID( "setd" );
    var desc7 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref4 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref4.putProperty( idChnl, idfsel );
    desc7.putReference( idnull, ref4 );
    var idT = charIDToTypeID( "T   " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idAl = charIDToTypeID( "Al  " );
    desc7.putEnumerated( idT, idOrdn, idAl );
executeAction( idsetd, desc7, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc8 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref5 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref5.putEnumerated( idChnl, idChnl, idMsk );
    desc8.putReference( idnull, ref5 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc8.putBoolean( idMkVs, false );
executeAction( idslct, desc8, DialogModes.NO );

// =======================================================
var idSbtr = charIDToTypeID( "Sbtr" );
    var desc9 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref6 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref6.putEnumerated( idChnl, idOrdn, idTrgt );
    desc9.putReference( idnull, ref6 );
    var idFrom = charIDToTypeID( "From" );
        var ref7 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref7.putProperty( idChnl, idfsel );
    desc9.putReference( idFrom, ref7 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc9.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc9.putBoolean( idmaskParameters, true );
executeAction( idSbtr, desc9, DialogModes.NO );

// =======================================================
//var idCpyM = charIDToTypeID( "CpyM" );
//executeAction( idCpyM, undefined, DialogModes.NO );

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