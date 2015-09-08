
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;

using System.Xml;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
 
    /* Contains submitted results for a Person filling out an Elicitation,
     * the actual bulk data is found in ElicitationData.JSON */
    public class ElicitationData {
        public int ID { get; set; }

        // The ElicitationAssignment (and thus elicitation) for which this data
        // is a fulfillment
        [ForeignKey("ElicitationAssignment")]
        public int ElicitationTask_ID { get; set; }
        public virtual ElicitationAssignment ElicitationAssignment { get; set; }

        // The version of the elicitation definition this data is submitted for
        // very useful to interpreting the data (which version is the person filling out?)
        [ForeignKey("ElicitationDefinition")]
        public int? ElicitationDefinition_ID { get; set; }
        public virtual ElicitationDefinition ElicitationDefinition { get; set; }

        // JSON: The actual data, for example, with a page titled "page title" and a widget with id 4847426739:

        /*
          {
            "Page Title":{
              "4847426739":{
                 "data":{
                    "value":"3.1",
                    "uncertaintyRangeLower":2.62,
                    "uncertaintyRangeUpper":3.42
                 },
                 "dataKeyText":"What was the volume-weighted industry average [[cSOR]] as of early 2011?"
              }
           },
           ...
         }
        */
        public string JSON { get; set; }

        [NotMapped]
        public JObject Data {
            get {
                return JObject.Parse(JSON);
            }
        }

        // Sometimes if something is broken, its really useful to know which
        // browser submitted the broken data
        public string BrowserUserAgent { get; set; }

        // Is this a final submission
        public bool Completed { get; set; }

        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        public ElicitationData Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var other = otherDB.ElicitationDatas.Create();
            other.ElicitationAssignment = this.ElicitationAssignment;
            otherDB.ElicitationDatas.Add(other);

            other.ElicitationDefinition = this.ElicitationDefinition;
            other.JSON = this.JSON;
            other.BrowserUserAgent = this.BrowserUserAgent;
            other.Completed = this.Completed;
            other.Created = this.Created;
            other.Modified = this.Modified;

            return other;
        }
    }

}
