// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc7 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref5 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref5.putName( idLyr, "CROP" );
    desc7.putReference( idnull, ref5 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc7.putBoolean( idMkVs, false );
executeAction( idslct, desc7, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc8 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref6 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref6.putEnumerated( idChnl, idChnl, idMsk );
    desc8.putReference( idnull, ref6 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc8.putBoolean( idMkVs, false );
executeAction( idslct, desc8, DialogModes.NO );

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc9 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref7 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref7.putEnumerated( idChnl, idOrdn, idTrgt );
    desc9.putReference( idnull, ref7 );
    var idT = charIDToTypeID( "T   " );
        var ref8 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref8.putProperty( idChnl, idfsel );
    desc9.putReference( idT, ref8 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc9.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc9.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc9, DialogModes.NO );

//-------------------=====================
// =======================================================
var idOpn = charIDToTypeID( "Opn " );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    desc1.putPath( idnull, new File( "/Users/administrator/PS Dev/Action Sources/R_D_Test_01.psb" ) );
executeAction( idOpn, desc1, DialogModes.NO );

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc2 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idnull, ref1 );
    var idT = charIDToTypeID( "T   " );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref2.putProperty( idChnl, idfsel );
    desc2.putReference( idT, ref2 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc2.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc2.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc2, DialogModes.NO );

// =======================================================
var idInvs = charIDToTypeID( "Invs" );
executeAction( idInvs, undefined, DialogModes.NO );

// =======================================================
var idCpyM = charIDToTypeID( "CpyM" );
executeAction( idCpyM, undefined, DialogModes.NO );

/////////////////////////////////////////////////////////////////////

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref2.putEnumerated( idChnl, idChnl, idMsk );
    desc3.putReference( idnull, ref2 );
    var idT = charIDToTypeID( "T   " );
        var ref3 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref3.putProperty( idChnl, idfsel );
    desc3.putReference( idT, ref3 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc3.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc3.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc3, DialogModes.NO );

// =======================================================
var idInvs = charIDToTypeID( "Invs" );
executeAction( idInvs, undefined, DialogModes.NO );

// =======================================================
var idCpyM = charIDToTypeID( "CpyM" );
executeAction( idCpyM, undefined, DialogModes.NO );

/////////////////////////////////////////////////////////////////////

// =======================================================
var idOpn = charIDToTypeID( "Opn " );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    desc1.putPath( idnull, new File( "/Users/administrator/PS Dev/Action Sources/R_D_Test_01.psb" ) );
executeAction( idOpn, desc1, DialogModes.NO );

// =======================================================
var idAdd = charIDToTypeID( "Add " );
    var desc2 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idnull, ref1 );
    var idT = charIDToTypeID( "T   " );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref2.putProperty( idChnl, idfsel );
    desc2.putReference( idT, ref2 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc2.putInteger( idVrsn, 1 );
    var idmaskParameters = stringIDToTypeID( "maskParameters" );
    desc2.putBoolean( idmaskParameters, true );
executeAction( idAdd, desc2, DialogModes.NO );

// =======================================================
var idInvs = charIDToTypeID( "Invs" );
executeAction( idInvs, undefined, DialogModes.NO );

// =======================================================
var idCpyM = charIDToTypeID( "CpyM" );
executeAction( idCpyM, undefined, DialogModes.NO );

//--------------------------------------------------------
//--------------------------------------------------------

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc6 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref3 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref3.putName( idLyr, "CROP" );
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


//--------------------------------------------------------
//--------------------------------------------------------

Layer2Selection = function()
{
   if( app.activeDocument.activeLayer.isBackgroundLayer ) return

   var desc   = new ActionDescriptor()
   var ref      = new ActionReference()
   ref.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ) )
   desc.putReference( charIDToTypeID( "null" ), ref )
   var ref1   = new ActionReference()
   ref1.putEnumerated( charIDToTypeID( "Chnl" ), charIDToTypeID( "Chnl" ), charIDToTypeID( "Trsp" ) )
   desc.putReference( charIDToTypeID( "T   " ), ref1 )
   executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO )
}

AddLayer2Selection = function()
{
   if( app.activeDocument.activeLayer.isBackgroundLayer ) return

   var desc   = new ActionDescriptor()
   var ref      = new ActionReference()
   ref.putEnumerated( charIDToTypeID( "Chnl" ), charIDToTypeID( "Chnl" ) , charIDToTypeID( "Trsp" ) )
   desc.putReference( charIDToTypeID( "null" ), ref )
   var ref1   = new ActionReference()
   ref1.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ) )
   desc.putReference( charIDToTypeID( "T   " ), ref1 )
   executeAction( charIDToTypeID( "Add " ), desc, DialogModes.NO )
}

var doc          = activeDocument
var layersToClip   = doc.artLayers.length - 1      // don't count the background
doc.crop([0, 0, doc.width, doc.height])            // clear everything that is outside of the document's boundaries

doc.activeLayer      = doc.artLayers[0]            // start with top layer
Layer2Selection()                                 // and make the first selection 

for( i = 1; i < layersToClip; i++)               // don't cound the top layer
{
   doc.activeLayer = doc.artLayers[i]            // switch to next layer
   activeDocument.quickMaskMode = true            // set the QuickMask mode
   activeDocument.activeLayer.threshold(128)      // apply a mid grey threshold
   activeDocument.quickMaskMode = false            // and get out of the QM mode
   doc.selection.clear()                           // clear the layer of unwanted pixels
   AddLayer2Selection()                           // add remaining pixels to the selection
}

doc.selection.deselect()                           // and clear the traces
doc.activeLayer = doc.artLayers[0]               // and select the top layer