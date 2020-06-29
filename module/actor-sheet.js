/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "sheet", "actor"],
  	  template: "systems/systeme_capharnahum/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    return data;
  }
  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }
  /* -------------------------------------------- */

  

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    //if (!this.options.editable) return;


    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });   

    // Change Equiped / Not equiped Item
    html.find('.item-change-equiped').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));

      if (item.data.data.equiped) {
        item.data.data.equiped = false ;
      }
      else {
        item.data.data.equiped = true ;
      }
      this.actor.render(true);
    
      //item.
    }); 


    html.find('.isEditable').click(ev => {
        
      //on vient de cliquer le bouton "cadenas ouvert"  pour le rendre non éditable
      this.options.editable = false;     
      console.log("changement du cadenas de ouvert --> fermé " + this.options.editable)  
      super.render(true);

    });
    html.find('.isNotEditable').click(ev => {
      //on vient de cliquer le bouton "cadenas fermé" pour le rendre non éditable
      this.options.editable = true;     
      console.log("changement du cadenas de fermé --> ouvert "  + this.options.editable)  
      super.render(true);
    });


    //test de ourimTourim
    html.find('.ourimTourim').click(ev => {

      //console.log(" this.actor.data.sheet.editable " + this.actor.data.sheet.editable);

      let ourimEtTourim = Math.floor(Math.random() * 2);
      console.log("ourim et tourim " + ourimEtTourim)
      let msg = "Vous avez choisi d'interroger les dieux ..." ;
      
      if (ourimEtTourim == 0) {
        //Ourim
        let ourim = "! OURIM !" ;
        let templateData = {
              data: {
                rollType: { value: msg },                
                rollOurimEtTourim: { value: ourim },                                  
              }
              };
        let template = 'systems/systeme_capharnahum/templates/cards/roll-card-ourim-et-tourim.html';
        renderTemplate(template, templateData).then(content => {
        ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: this.actor}), 
         content: content
        });   
        });      
      }
      else {
        //Tourim
        let tourim = "! TOURIM !" ;
        let templateData = {
              data: {
                rollType: { value: msg },                
                rollOurimEtTourim: { value: tourim },                                  
              }
              };
        let template = 'systems/systeme_capharnahum/templates/cards/roll-card-ourim-et-tourim.html';
        renderTemplate(template, templateData).then(content => {
        ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: this.actor}), 
         content: content
        });   
        });
      }
    });   

    // test comp
    html.find('.rollable').click(ev => {

      // boite de dialogue et choix de la carac
      let carac ;
      let vantardise = 0;
      let sous_comp = ev.currentTarget.getAttribute('value');
      console.log(" sous comp: " + sous_comp);

      let dataType = ev.currentTarget.getAttribute('data-type');
      console.log("dataType : " + dataType);
  
      if (dataType == "jet-de-sous-competences") {
        this.dialogCaracteristique(ev)    
      }
      if (dataType == "jet-de-caracteristiques") {      
        let carac = ev.currentTarget.getAttribute('value');
        console.log("carac avant vantardise " + carac)
        this.dialogVantardise(ev, carac)
      }  

      if (dataType == "jet-de-initiative") {
        let initiative =  new Roll(  "1d" + this.actor.data.data.abilities.init.max);
        initiative.roll();
        
        this.actor.data.data.abilities.init.value = initiative.total;
        this.actor.render(true);
        //data.abilities.init.value = initiative.total;
        console.log("initiative lancée est de " + initiative.total) ;
        console.log("this.actor.data.data.abilities.init.value est de " + this.actor.data.data.abilities.init.value) ;

      }  
      if (dataType == "jet-de-entrainement") {
        // on lance un jet d'entrainement
        let carac = "souffle";
        this.dialogVantardise(ev, carac)

      }  
    });
  }

  controleDesVantardisesPourCaracteristique (ev,carac,vantardise){
    let valueCarac = this.actor.data.data.attributes[carac].value;    
    if(valueCarac > vantardise ) {  return true;   }
    else  { return false ;}
  }
  controleDesVantardisesPourHeroisme (ev,carac,vantardise){    
    let valueHeroisme = this.actor.data.data.vertus.heroisme.value;
    if( valueHeroisme >= vantardise ) {  return true;   }
    else  { return false ;}
  }

  controlGeneral (ev,carac,vantardise){

    if (this.controleDesVantardisesPourCaracteristique(ev,carac,vantardise)) {
             
      if (this.controleDesVantardisesPourHeroisme(ev,carac,vantardise)) {
        
        let dataType = ev.currentTarget.getAttribute('data-type');
        if (dataType == "jet-de-sous-competences") {
          let competence ;
          this.testComp(ev, carac, vantardise);     

        }
        if (dataType == "jet-de-caracteristiques") {      
          this.testCarac(ev, carac, vantardise)
        }  
        if (dataType == "jet-de-entrainement") {      
          console.log("Appel de test comp pour le jet d'entrainement")
          let comp = ev.currentTarget.setAttribute('value',"entrainement");
          this.testComp(ev, carac, vantardise);

        } 
        
      } 
      else {
        let valueHeroisme = this.actor.data.data.vertus.heroisme.value ;
        ui.notifications.warn("Vous ne pouvez pas prendre plus de vantardises que votre score d'Héroisme à savoir :  " + valueHeroisme);
      }
    }
    else
    {
      let nomCarac = this.actor.data.data.attributes[carac].label;
      let valueCarac = this.actor.data.data.attributes[carac].value;
      ui.notifications.warn("Vous devez prendre moins de vantardises que votre score de " + nomCarac + " à savoir : " + valueCarac);
    }

  }

  dialogVantardise (ev,carac) {
      console.log("Ouverture de la fenetre de vantardise")
      let vantardise = 0;
      let dialogVantardise = new Dialog({
        title: "Vantardise",
        content: "Veuillez choisir le nombre de vantardise que vous prenez :",
        buttons: {
          zero: {
            label: "Aucune",
            callback: () => {vantardise = 0;
            this.controlGeneral (ev,carac,vantardise)}
          },
          une: {
            label: "Une",
            callback: () => {vantardise = 1;
              this.controlGeneral (ev,carac,vantardise)}
          },
          deux: {
            label: "Deux",
            callback: () => {vantardise = 2;
              this.controlGeneral (ev,carac,vantardise)}
          },
          trois: {
            label: "Trois",
            callback: () => {vantardise = 3;
              this.controlGeneral (ev,carac,vantardise)}
          },
          quatre: {
            label: "Quatre",
            callback: () => {vantardise = 4;
              this.controlGeneral (ev,carac,vantardise)}
          },
          cinq: {
            label: "Cinq",
            callback: () => {vantardise = 5;
              this.controlGeneral (ev,carac,vantardise)}
          }
        },
        default: "zero",
        close: () => {    } 
      });
      console.log("fin et render de la fenetre de vantardise")
      dialogVantardise.render(true); 
  }
  dialogCaracteristique (ev) {
    let carac ;
    let sous_comp = ev.currentTarget.getAttribute('value');
    
    let d = new Dialog({
        title: "Caractéristique",
        content: "Veuillez choisir la Caractéristique à utiliser :",
        buttons: {
          coordination: {
            label: "Coordination",
            callback: () => {carac = "coordination";
            this.dialogVantardise(ev,carac)}
          },
          charme: {
            label: "Charme",
            callback: () => {carac = "charme"
            this.dialogVantardise(ev,carac)}
          },
          souffle: {
            label: "Souffle",
            callback: () => {carac = "souffle"
            this.dialogVantardise(ev,carac)}
          },
          puissance: {
            label: "Puissance",
            callback: () => {carac = "puissance"
            this.dialogVantardise(ev,carac)}
          },
          sagesse: {
            label: "Sagesse",
            callback: () =>  {carac = "sagesse"
            this.dialogVantardise(ev,carac)}
          }
        },
        default: "charme",
        close: () =>  {}   
          
        
      });
      d.render(true);      

  }
  testCarac (ev,carac,vantardise){


    //ici on va tester une caractéristiques + niveau héroisme
    
    let nomHeroisme = this.actor.data.data.vertus.heroisme.label;         
    let valueHeroisme = this.actor.data.data.vertus.heroisme.value;

    let nomCarac = this.actor.data.data.attributes[carac].label;
    let valueCarac = this.actor.data.data.attributes[carac].value;

    let nomDeDragon = this.actor.data.data.abilities.dragon.label;
    let valueDeDragon = this.actor.data.data.abilities.dragon.value;          

    // tableau contenant chaque jet de dé, en dehors des dés dragons
    let tousLesDesDragons ;    
   
    //Lancement des dés dragons
    tousLesDesDragons = this.lancerDesDragons(valueDeDragon);

    // total des dés à lancer.
    let totalDesNormaux = valueHeroisme + valueCarac;

    //Néanmoins, il faut y soustraire le nombre de dés dragons 
    totalDesNormaux = totalDesNormaux - valueDeDragon;

    // tableau contenant chaque jet de dé, en dehors des dés dragons
    let résultatDésNormaux ;
    //Lancement des dés normaux  
    if (totalDesNormaux != 0) {
      résultatDésNormaux = this.lancerDesNormaux(totalDesNormaux);
    }else {
      résultatDésNormaux = null;
    }       
    
    let nombreDeDésTotal = valueCarac + valueHeroisme + "d6" + " avec " + vantardise + " vantardises";
    let nomCaracEtCompétences = nomCarac + " + " + nomHeroisme ;
    console.log("nombreDeDés " + nombreDeDésTotal + " nomCaracEtCompétences " + nomCaracEtCompétences);
    this.createMessage(nombreDeDésTotal,tousLesDesDragons,résultatDésNormaux,nomCaracEtCompétences,nomCarac,valueCarac,nomHeroisme,valueHeroisme, vantardise);   
   

  }

  // ouais je sais c'est très moche cette fonction.
  // j'ai modifié mon template.json.
  // les sous_competences sont passées sous les compétences.
  // DU coup quand je clique sur une sous_ompetences, je n'ai pas sa competence pour y acceder
  // c'est très moche cette fonction
  // si le template rebouge faudra la modifier
  // Fais chier
  trouverCompetencesAvecSousCompetence (comp) {
    if (comp == "epreuve" || comp =="equitation" || comp == "contes" || comp == "periples") {
          return "aventurier"
          } 
    if (comp == "science" || comp =="enseigner" || comp == "peuples_et_histoire" || comp == "percevoir") {
          return "sage"
          } 
    if (comp == "ne_pas_perdre_la_face" || comp =="elegance" || comp == "flatter" || comp == "negoce_et_salamalecs") {
          return "prince"
          } 
    if (comp == "inspiration" || comp =="priere" || comp == "sacrifice" || comp == "verbe_sacre") {
          return "sorcier"
          }             
    if (comp == "arme" || comp =="commander" || comp == "entrainement" || comp == "impressionner") {
          return "guerrier"
          } 
    if (comp == "galvaniser" || comp =="comedie" || comp == "poesie" || comp == "musique") {
          return "poete"
          } 
    if (comp == "assassinat" || comp =="detrousser" || comp == "discretion" || comp == "s_introduire") {
          return "malandrin"
          } 
    if (comp == "agriculture" || comp =="artisanat" || comp == "compagnonnage" || comp == "compagnonnage") {
          return "travailleur"
          }       
  }

    testComp (ev,carac,vantardise){
      // test compétence
        
          let comp = ev.currentTarget.getAttribute('value');
          ///console.log("comp est " + comp) 
          
          let competence = this.trouverCompetencesAvecSousCompetence (comp);
          //console.log("competence trouve avec fonction moche est " + competence) 
          let nomComp = this.actor.data.data.competences[competence].sous_competences[comp].label;         
          //console.log("nomComp est " + nomComp) 
          let valueComp = this.actor.data.data.competences[competence].sous_competences[comp].value;   
          //console.log("nomComp est " + nomComp) 
          if (valueComp == null) {
            valueComp = 0 ;
          }

          let nomCarac = this.actor.data.data.attributes[carac].label;
          let valueCarac = this.actor.data.data.attributes[carac].value;

          let nomDeDragon = this.actor.data.data.abilities.dragon.label;
          let valueDeDragon = this.actor.data.data.abilities.dragon.value;          

          // tableau contenant chaque jet de dé, en dehors des dés dragons
          let tousLesDesDragons ;

          //Lancement des dés dragons
          tousLesDesDragons = this.lancerDesDragons(valueDeDragon);

          // total des dés à lancer.
          let totalDesNormaux = valueComp + valueCarac;

          //Néanmoins, il faut y soustraire le nombre de dés dragons 
          totalDesNormaux = totalDesNormaux - valueDeDragon;

          // tableau contenant chaque jet de dé, en dehors des dés dragons
          let résultatDésNormaux ;

          //Lancement des dés normaux  
          if (totalDesNormaux != 0) {
            résultatDésNormaux = this.lancerDesNormaux(totalDesNormaux);
          }else {
            résultatDésNormaux = null;
          }
                   
     
          let nombreDeDésTotal = valueCarac + valueComp + "d6" + " avec " + vantardise + " vantardises";
          let nomCaracEtCompétences = nomCarac + " + " + nomComp ;
          console.log("nombreDeDés " + nombreDeDésTotal + " nomCaracEtCompétences " + nomCaracEtCompétences);

          this.createMessage(nombreDeDésTotal,tousLesDesDragons,résultatDésNormaux,nomCaracEtCompétences,nomCarac,valueCarac,nomComp, valueComp, vantardise);   

    }  


    countOccurences(tab) {
      console.log("tab " + tab)
      let result = [0,0,0,0,0,0];
      //console.log("result " + result)
  
      tab.forEach(function(elem){
        //console.log("elem " + elem)
        if(elem-1 in result){
          result[elem-1] = ++result[elem-1];        
        }
        else{
          result[elem-1] = 1;       
        }
      });
      console.log("result " + result)
      return result;
    }

  gestionDesConstellations (ensemble_des_Des,affichage_constellation_reussie) {

        let nombreOccurence =  this.countOccurences(ensemble_des_Des);

        //console.log("nombreOccurence length " + nombreOccurence.length)

        affichage_constellation_reussie.constellationPresente = false;
        affichage_constellation_reussie.message = "Constellation : ";

        let j = 0;
        for (let i = 0; i < nombreOccurence.length ; i++) {
          //console.log("nombreOccurence " + nombreOccurence[i])   
          if (nombreOccurence[i] >= 3) {
            if (j !=0) {
              affichage_constellation_reussie.message += " et une autre de"; 
            }
            affichage_constellation_reussie.message += " " + nombreOccurence[i] + " dés avec " + (i+1) ;
            
            j = j + 1;
            affichage_constellation_reussie.constellationPresente = true;
          }
        }
        console.log("affichage_constellation_reussie " + affichage_constellation_reussie)
        return affichage_constellation_reussie.constellationPresente;    
  }
 

  lancerDesDragons(valueDeDragon){

    //Lancement des dés dragons      

    let tousLesDesDragons = [0];
    
    // pour chaque dé dragon
    for (let i = 0; i < valueDeDragon ; i++) {

      let r = new Roll( "1d6x>5");
      r.roll();
      console.log("le dé dragon " + i +" vient de faire " + r.total);
      tousLesDesDragons[i] = r.total ;
    }

    // console.log affichage dans la console du résultat de chaque dés dragons
    //:tousLesDesDragons.forEach(function(item, index, array) {
    //  console.log(item, index);
    //});
    console.log("Dés Dragons " + tousLesDesDragons);

    return tousLesDesDragons
    
  }
    //Lancement des dés normaux    
    // retour un tableau de dés triés par ordre décroissant
  lancerDesNormaux(nombreDeDés){  

    // tableau contenant chaque jet de dé, en dehors des dés dragons
          let résultatDésNormaux = [0];
          for (let i = 0; i < nombreDeDés ; i++) {
            let r = new Roll( "1d6");
            r.roll();
            résultatDésNormaux[i] = r.total ;
          }

          // console.log affichage dans la console du résultat de chaque dé
          //résultatDésNormaux.forEach(function(item, index, array) {
          //  console.log(item, index);
          //});

          // tri du tableau des dés du plus grand au plus petit
          résultatDésNormaux.sort(function(a, b) {
            return b - a;
          });
          console.log("Dés normaux " + résultatDésNormaux);

    return résultatDésNormaux

  }
  /*
  entrainement (QR,Toucher,nomCarac,nomComp) {

    if ( nomCarac =="Souffle" && nomComp == "Entraînement") {
      let bestQR = QR;
      if (Toucher[0] < 6){
        bestQR[0] = 0;
      }
      if (Toucher[1] < 6){
        bestQR[1] = 0;
      }

      if (bestQR.length == 0) {
        this.actor.data.data.abilities.DeEntrainement.value = 0;
      }
      else {      
        bestQR.sort(function(a, b) {
        return b - a;
        });

        this.actor.data.data.abilities.DeEntrainement.value = bestQR[0]
      }  
      
      this.actor.render(true);
    }
  }
  */
 

  createMessage(rollFormula, rollResultDéDragon, rollResultAutreDé, rollType, nomCarac, valueCarac, nomComp,valueComp,vantardise) {


    // Si le résultat des autres dés est null, on a que 1 dé carac qui est le dragon

    /*
    if (rollResultAutreDé != null) {
    pooOfDice = new DicePool([rollResultAutreDé,rollResultDéDragon]);
    }
    else {
      pooOfDice = new DicePool([rollResultDéDragon]);
    }
    */
        
    console.log("rollFormula"  + rollFormula)

    //On construit la carac à laquelle on enlève la vantardise
    let caracAvecVantardise = 0;
        if (valueCarac > vantardise) {
          caracAvecVantardise = valueCarac - vantardise ;
        }

    // Dans ce cas, on a plus qu'un seul dé dragon 
    // tri du tableau des dés du plus grand au plus petit
    // on garde que le meilleur dé dragon
    if (this.actor.data.data.abilities.dragon.value == 2 && valueCarac == 1){      

        // Dans ce cas, on a plus qu'un seul dé dragon 
        // tri du tableau des dés du plus grand au plus petit
        rollResultDéDragon.sort(function(a, b) {
          return b - a;
        });

        // on garde que le meilleur dé dragon
        rollResultDéDragon.splice(1,1);
      console.log("rollResultDéDragon " + rollResultDéDragon)
    }

    // Si on un seul dé dragon
    if (this.actor.data.data.abilities.dragon.value == 1)
    {
        
          let toucherAvecDragon = 0;        
          let qualiteSansDragon = 0;

          //Concaténation du dés dragons du côté du toucher, au début
          let deDragonCoteReussite = rollResultDéDragon.concat(rollResultAutreDé)  ;
          //console.log("deDragonCoteReussite " + deDragonCoteReussite)
          
          for (let i = 0; i < caracAvecVantardise   ; i++) {          
            toucherAvecDragon = toucherAvecDragon + deDragonCoteReussite[i];           
          }        

          for (let i = caracAvecVantardise  ; i < deDragonCoteReussite.length ; i++) {          
            qualiteSansDragon = qualiteSansDragon + deDragonCoteReussite[i];
          
          }
          //console.log("toucherAvecDragon " + toucherAvecDragon)
          //console.log("toucherAvecDragon " + toucherAvecDragon)

          let toucherSansDragon = 0;
          let qualitéAvecDragon = 0;
          //Concaténation du dés dragons du côté de la qualité à la fin
          let deDragonCoteQualite =   rollResultAutreDé.concat(rollResultDéDragon)  ;        
          //console.log("deDragonCoteQualite " + deDragonCoteQualite)

          // Si la comp est de 0 et qu'il n'y a pas de vantardise.
          // tous les dés se rangent du côté du toucher
          // il faut en prendre 1 de moins dans rollResultAutreDé sinon on dépasse et error

          /*
          if (valueComp == 0  && vantardise==0) {
            caracAvecVantardise = caracAvecVantardise -1;
            toucherSansDragonNew = toucherSansDragonNew +rollResultDéDragon.total ;
          }
          else {
            qualitéAvecDragonNew = qualitéAvecDragonNew + rollResultDéDragon.total ;
          }
          */

          for (let i = 0; i < caracAvecVantardise     ; i++) {              
            toucherSansDragon = toucherSansDragon + deDragonCoteQualite[i];  
                
          }        
          
          for (let i = caracAvecVantardise  ; i < deDragonCoteQualite.length ; i++) {              
            qualitéAvecDragon = qualitéAvecDragon + deDragonCoteQualite[i];
            
          }
          
          let QRSansDragon = Math.floor(qualiteSansDragon/3);
          let QRAvecDragon = Math.floor(qualitéAvecDragon/3);
          console.log("QRSansDragon " + QRSansDragon)
          console.log("QRAvecDragon " + QRAvecDragon)


          //this.entrainement ( [QRSansDragon,QRAvecDragon],[toucherAvecDragonNew,toucherSansDragonNew], nomCarac, nomComp ) ;        


          // gestion des constellations  
          let affichage_constellation_reussie = { message : "", constellationPresente : false};
          this.gestionDesConstellations(deDragonCoteQualite,affichage_constellation_reussie);

          if(affichage_constellation_reussie.constellationPresente) {
            console.log("la constellation est presente ")
            console.log("affichage_constellation_reussie " + affichage_constellation_reussie.message)
          }
          else {
            console.log("la constellation est absente ")
            console.log("affichage_constellation_reussie " + affichage_constellation_reussie.message)
            affichage_constellation_reussie.message = "Pas de Constellation ";
          }
          
          console.log("affichage_constellation_reussie" + affichage_constellation_reussie)
          let messageToucherAvecDragon = "Toucher " + toucherAvecDragon + " QR " + QRSansDragon + " (" + qualiteSansDragon +")";
          let messageToucherSansDragon = "Toucher " + toucherSansDragon + " QR " + QRAvecDragon + " (" + qualitéAvecDragon +")";

          let messagePourAutreDe = "Autres dés --> ";
          
          for (let i = 0; i < rollResultAutreDé.length ; i++) {              
            messagePourAutreDe +=  rollResultAutreDé[i] + " " ;
            if (i != rollResultAutreDé.length-1) {
              messagePourAutreDe += " - " ;
            }
          }
          console.log("messagePourAutreDe " + messagePourAutreDe)

          let messageDeDragon = "Dé Dragon  --> " + rollResultDéDragon[0];
          console.log("messageDeDragon")
          var templateData = {
            data: {
              rollType: { value: rollType },
              rollFormula: { value: rollFormula },
              rollmessageToucherAvecDragon: { value: messageToucherAvecDragon },    
              rollmessageToucherSansDragon: { value: messageToucherSansDragon },
              rollmessageDeDragon : { value : messageDeDragon},
              rollAutreDe : {value : messagePourAutreDe },
              rollConstellation : {value : affichage_constellation_reussie.message}   
            }
            };
            console.log("toucherSansDragon " + toucherSansDragon)
            console.log("qualitéAvecDragon " + qualitéAvecDragon)
          let template = 'systems/systeme_capharnahum/templates/cards/roll-card.html';
        
          renderTemplate(template, templateData).then(content => {
            ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor}), 
            content: content
            });   
            });
        
    }
    else {
    // deux dés dragons
      if (this.actor.data.data.abilities.dragon.value == 2){
        console.log("deux dés dragons !");
        
        let affichageDeDragon = "";       
        console.log("des dragons 1 " + rollResultDéDragon[0])
        console.log("des dragons 2 " + rollResultDéDragon[1])

        // (D1 et D2) côté réussite


        /*
        rollResultAutreDé.dice[0].rolls[i].roll;

        rollResultDéDragon.total

        */

        // toucher correspond au nombre de dés de la caractéristique.
        let toucherD1D2 = 0;
        let toucherD1D2New = 0;        
        // la qualité correspond au nombre de dés restants
        let qualiteSansDragon = 0;

        let d1D2Reussite =   rollResultDéDragon.concat(rollResultAutreDé)  ; 



        for (let i = 0; i < caracAvecVantardise  ; i++) {          
          toucherD1D2 = toucherD1D2 + d1D2Reussite[i];
        }

        for (let i = caracAvecVantardise ; i < d1D2Reussite.length ; i++) {          
          qualiteSansDragon = qualiteSansDragon + d1D2Reussite[i];
        }

        // (D1 et D2) côté qualité

        let toucherSansDragon = 0;
        let qualiteD1D2 = 0;
        let d1D2Qualite =   rollResultAutreDé.concat(rollResultDéDragon)  ; 

        
        for (let i = 0; i < caracAvecVantardise  ; i++) {              
          toucherSansDragon = toucherSansDragon + d1D2Qualite[i];
        }
        
        for (let i = caracAvecVantardise; i < d1D2Qualite.length ; i++) {              
          qualiteD1D2 = qualiteD1D2 + d1D2Qualite[i];
        }
             

        let d1ReussiteD2Qualite  = rollResultAutreDé.slice();
        let d2ReussiteD1Qualite  = rollResultAutreDé.slice();

        // D1 côté réussite et D2 côté qualité

        let toucherD1 = 0;
        let qualiteD2 = 0;

        console.log("rollResultAutreDé " + rollResultAutreDé )

        d1ReussiteD2Qualite.unshift(rollResultDéDragon[0]);
        d1ReussiteD2Qualite.push(rollResultDéDragon[1]);
        
        console.log("d1ReussiteD2Qualite " + d1ReussiteD2Qualite )         

        
        for (let i = 0; i < caracAvecVantardise   ; i++) {              
          toucherD1 = toucherD1 + d1ReussiteD2Qualite[i];
        }            

        for (let i = caracAvecVantardise ; i < d1ReussiteD2Qualite.length ; i++) {              
          qualiteD2 = qualiteD2 + d1ReussiteD2Qualite[i];
        }           

        // D2 côté réussite et D1 côté qualité
        
        let toucherD2 = 0;
        let qualiteD1 = 0;
        console.log("rollResultAutreDé " + rollResultAutreDé )


        d2ReussiteD1Qualite.push(rollResultDéDragon[0]);
        d2ReussiteD1Qualite.unshift(rollResultDéDragon[1]);

        console.log("d2ReussiteD1Qualite " + d2ReussiteD1Qualite )

        for (let i = 0; i < caracAvecVantardise   ; i++) {              
          toucherD2 = toucherD2 + d2ReussiteD1Qualite[i];
        }       
        
        for (let i = caracAvecVantardise ; i < d2ReussiteD1Qualite.length ; i++) {              
          qualiteD1 = qualiteD1 + d2ReussiteD1Qualite[i];
        }
   
        let QRSansDragon = Math.floor(qualiteSansDragon/3);
        let QRqualiteD1D2 = Math.floor(qualiteD1D2/3);  
        let QRqualiteD1 = Math.floor(qualiteD1/3);
        let QRqualiteD2 = Math.floor(qualiteD2/3); 


        // gestion des constellations  
        let affichage_constellation_reussie = { message : "", constellationPresente : false};
        this.gestionDesConstellations(d1D2Reussite,affichage_constellation_reussie);

         if(affichage_constellation_reussie.constellationPresente) {
          console.log("la constellation est presente ")
          console.log("affichage_constellation_reussie " + affichage_constellation_reussie.message)
         }
         else {
          console.log("la constellation est absente ")
           console.log("affichage_constellation_reussie " + affichage_constellation_reussie.message)
           affichage_constellation_reussie.message = "Pas de Constellation ";
         }

         let messageToucherAvecDragon = "Toucher " + toucherD1D2 + " QR " + QRSansDragon + " (" + qualiteSansDragon +")";
         let messageToucherSansDragon = "Toucher " + toucherSansDragon + " QR " + QRqualiteD1D2 + " (" + qualiteD1D2 +")";

         let messageToucherD1QualiteD2 = "Toucher " + toucherD1 + " QR " + QRqualiteD2 + " (" + qualiteD2 +")";
         let messageToucherD2QualiteD1 = "Toucher " + toucherD2 + " QR " + QRqualiteD1 + " (" + qualiteD1 +")";

         let messagePourAutreDe = "Autres dés --> ";
         
         for (let i = 0; i < rollResultAutreDé.length ; i++) {              
              messagePourAutreDe +=  rollResultAutreDé[i] 
              if (i != rollResultAutreDé.length-1) {
                messagePourAutreDe += " - " ;
              }
        }
        console.log("messagePourAutreDe " + messagePourAutreDe)

        let messageDeDragon = "Dé Dragon  --> " + rollResultDéDragon[0] + " - " + rollResultDéDragon[1] ;
        console.log("messageDeDragon")

        console.log("affichage_constellation_reussie.message " + affichage_constellation_reussie.message)

        var templateData = {
              data: {
                rollType: { value: rollType },
                rollFormula: { value: rollFormula },
                rollmessageToucherAvecDragon: { value: messageToucherAvecDragon },
                rollmessageToucherSansDragon: { value: messageToucherSansDragon }, 
                rollmessageToucherD1QualiteD2: { value: messageToucherD1QualiteD2 },
                rollmessageToucherD2QualiteD1: { value: messageToucherD2QualiteD1 },
                rollmessageDeDragon : { value : messageDeDragon},
                rollAutreDe : {value : messagePourAutreDe },
                rollConstellation : {value : affichage_constellation_reussie.message},          
              }
              };

        let template = 'systems/systeme_capharnahum/templates/cards/roll-card-2-dragon-dice.html';
        renderTemplate(template, templateData).then(content => {
        ChatMessage.create({
         speaker: ChatMessage.getSpeaker({ actor: this.actor}), 
         content: content
        });   
        });

      }
      else {
        // trois dés dragons
        if (this.actor.data.data.abilities.dragon.value == 3){
          console.log("trois dés dragons !");

          // Compromis : j'ai implementé les 2 dés dragons
          // mais je ne gère pas les 3 dés dragons pour l'instant !
          //avançons

        // (D1 et D2 et D3) côté réussite

        // (D1 et D2 et D3) côté qualité

        // D1 côté réussite et D2 et D3 côté qualité

        // D2 côté réussite et D1 et D3 côté qualité

        // D3 côté réussite et D1 et D2 côté qualité

        // D1 et D2 côté réussite et D3 côté qualité

        // D1 et D3 côté réussite et D2 côté qualité

        // D2 et D3 côté réussite et D1 côté qualité

        } 
        else {
           console.log("On ne peut pas avoir plus de trois dés dragons merci de (t)repasser ...") 
        }   
      }
    }
  }
  


  
}
