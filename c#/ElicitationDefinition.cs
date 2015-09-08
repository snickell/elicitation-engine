
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;

using System.Xml;

// Warning: This comes from assembly Fizzler.Sandbox, and may not be complete
using Fizzler.Systems.XmlNodeQuery;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations.Schema;

namespace NearZero.Models {
    /* An ElicitationDefinition defines the content of an Elicitation. It is an XML format,
     * generated primarily by the client-side Javascript code */
    public class ElicitationDefinition {
        public ElicitationDefinition() {
            this.Definition = "<elicitation><page title='Page Title Goes Here'></page></elicitation>";
        }

        public int ID { get; set; }

        // The primary piece of data, the definition
        // itself, in Elicitation XML Format (TM)
        public string Definition { get; set; }

        public XmlNode getDefinitionForWidget(string widgetInstanceID) {
            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(this.Definition);
            return xmlDoc.QuerySelector("[id='" + widgetInstanceID + "']");
        }

        public static string[] widgetTypesWithResultsCharts = {
            "card-rank",
            "time-trend"
        };

        [NotMapped]
        public class WidgetInstance {
            public string instanceID;
            public string questionText;
            public string widgetType;
            public bool widgetTypeHasResultsChart {
                get {
                    return ElicitationDefinition.widgetTypesWithResultsCharts.Contains(widgetType);
                }
            }

            public override bool Equals(Object obj) {
                if (obj == null) return false;
                WidgetInstance p = obj as WidgetInstance;
                if ((System.Object)p == null) return false;
                return (instanceID == p.instanceID) && (questionText == p.questionText);
            }
        }

        [NotMapped]
        public List<WidgetInstance> WidgetInstances {
            get {
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(this.Definition);
                var widgetInstances = xmlDoc.QuerySelectorAll("[id]").Select(w => new WidgetInstance {
                    instanceID = w.Attributes.GetNamedItem("id").InnerText,
                    questionText = w.QuerySelector("label").InnerText,
                    widgetType = w.LocalName
                }).ToList();
                return widgetInstances;
            }
        }

        public string ChangeSummary { get; set; }

        [ForeignKey("Elicitation")]
        public int Elicitation_ID { get; set; }
        public virtual Elicitation Elicitation { get; set; }

        [ForeignKey("CreatedBy")]
        public int? CreatedBy_ID { get; set; }
        public virtual Person CreatedBy { get; set; }

        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        public ElicitationDefinition Clone(NearZeroContext thisDB, NearZeroContext otherDB) {
            var other = otherDB.ElicitationDefinitions.Create();
            other.Elicitation = this.Elicitation;
            otherDB.ElicitationDefinitions.Add(other);

            other.Definition = this.Definition;
            other.ChangeSummary = this.ChangeSummary;
            other.CreatedBy = this.CreatedBy;
            other.Created = this.Created;
            other.Modified = this.Modified;

            return other;
        }
    }


}
