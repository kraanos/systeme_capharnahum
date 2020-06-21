/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class WeaponItemSheet extends ItemSheet {

    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
              classes: ["worldbuilding", "sheet", "item"],
              template: "systems/systeme_capharnahum/templates/weapon-sheet.html",
              width: 520,
              height: 480,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details"}]
          });
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      const data = super.getData();
      data.dtypes = ["String", "Number", "Boolean"];
      for ( let attr of Object.values(data.data.attributes) ) {
        attr.isCheckbox = attr.dtype === "Boolean";
      }
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
  

  
  
   
  }
  