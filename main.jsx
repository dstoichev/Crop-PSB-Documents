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
        
        doc.selection.selectAll();        
        
        cropLayerReference = doc.artLayers.getByName(cropLayerName);
        doc.activeLayer = cropLayerReference;
        try {
            doc.selection.clear();
        } catch (e) {
         
        }
                
        selectJustTheCrop();
        
        doc.selection.invert();
        doc.selection.copy(true);
        
        alertText = ''.concat(alertText, doc.selection.typename,  "\n");
        alertText = ''.concat(alertText, doc.name, "\n\n");
        saveJpeg(doc);
    }
    
    alert(alertText);    
}

function selectJustTheCrop()
{
    // =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc5 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref2 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref2.putName( idLyr, "CROP" );
    desc5.putReference( idnull, ref2 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc5.putBoolean( idMkVs, false );
executeAction( idslct, desc5, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc6 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref3 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref3.putEnumerated( idChnl, idChnl, idMsk );
    desc6.putReference( idnull, ref3 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc6.putBoolean( idMkVs, false );
executeAction( idslct, desc6, DialogModes.NO );

// =======================================================
var idIntr = charIDToTypeID( "Intr" );
    var desc7 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref4 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref4.putEnumerated( idChnl, idOrdn, idTrgt );
    desc7.putReference( idnull, ref4 );
    var idWith = charIDToTypeID( "With" );
        var ref5 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref5.putProperty( idChnl, idfsel );
    desc7.putReference( idWith, ref5 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc7.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc7.putBoolean( idmaskParameters, true );
executeAction( idIntr, desc7, DialogModes.NO );

}

function saveJpeg(doc)
{
    var currentActive = app.activeDocument,
        saveName = doc.name.split('.')[0],
        tempDocumentName = 'Temp-' + saveName,
        file = new File(savePath + '/' + saveName + '.jpg'),
        opts = new JPEGSaveOptions();
        
    opts.quality = 10;
    
    app.documents.add(null, null, 72, tempDocumentName, NewDocumentMode.RGB);
    currentActive = app.documents.getByName(tempDocumentName);
    currentActive.paste();
    currentActive.flatten();
    currentActive.saveAs(file, opts, true, Extension.LOWERCASE);
    currentActive.close(SaveOptions.DONOTSAVECHANGES)
}

main();