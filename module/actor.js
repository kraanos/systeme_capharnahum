/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SimpleActor extends Actor {

  /** @override */
  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get("systeme_capharnahum", "macroShorthand");

    // Re-map all attributes onto the base roll data
    if ( !!shorthand ) {
      for ( let [k, v] of Object.entries(data.attributes) ) {
        if ( !(k in data) ) data[k] = v.value;
        
      }
      delete data.attributes;
    }

    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({strict: true});
      let itemData = duplicate(i.data);
      if ( !!shorthand ) {
        for ( let [k, v] of Object.entries(itemData.attributes) ) {
          if ( !(k in itemData) ) itemData[k] = v.value;
        }
        delete itemData["attributes"];
      }
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }

  prepareData() {
      
    super.prepareData();
    const actorData = this.data;
    const data = actorData.data;

    if (actorData.type === "character") {
      let aventurier = data.competences.aventurier;
      let epreuve = aventurier.sous_competences.epreuve;    

      // Défense passive est égale à Coordination + Epreuve + 6
      data.abilities.defense_passive.value = 6 + data.attributes.coordination.value  + epreuve.value ;

      //Trempe est égale Souffle + Héroisme + Armure
      data.abilities.trempe.value =  data.attributes.souffle.value + data.vertus.heroisme.value + data.abilities.armure.value ;

      //Points de vie maximum est égal à Souffle *10
      data.abilities.point_de_vie.max =  6 * data.attributes.souffle.value ;

      //Initiative maximum est égal à 1 + ( Souffle + Coordination + Sagesse) / 3 
      data.abilities.init.max =  1 + Math.floor( (data.attributes.souffle.value + data.attributes.coordination.value + data.attributes.sagesse.value)/3  ) ;
      
      //console.log("data.abilities.init.value" + data.abilities.init.value) 
      if (game.user.isGM) {        
        console.log("It's a GM")
        data.isGM = true;

      }
      else
      {
        console.log("It's not a GM")
        data.isGM = false;
      }
      }
  }
}