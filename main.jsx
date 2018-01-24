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
        cropLayerReference = doc.artLayers.getByName(cropLayerName);
        doc.activeLayer = cropLayerReference;
        doc.selection.clear();
        doc.selection.selectAll();
        
        selectJustTheCrop();
        
        /*
        doc.selection.copy(true);
        */
        
        alertText = ''.concat(alertText, doc.selection.typename,  "\n");
        alertText = ''.concat(alertText, doc.name, "\n\n");
        //saveJpeg(doc);
    }
    
    alert(alertText);    
}

function selectJustTheCrop()
{
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
}

function saveJpeg(doc)
{
    var saveName = doc.name.split('.')[0],
        file = new File(savePath + '/' + saveName + '.jpg'),
        opts = new JPEGSaveOptions();
        
    opts.quality = 10;
    doc.saveAs(file, opts, true, Extension.LOWERCASE);
}

main();