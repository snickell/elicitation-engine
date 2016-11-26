import EAT from './app'

import { RateLimitedViewMixin } from "./rate-limited-view";
EAT.RateLimitedViewMixin = RateLimitedViewMixin;

import { MarkdownLabel, CreateMarkdownConverter, VanillaMarkdownLabel } from "./markdown-label";
EAT.MarkdownLabel = MarkdownLabel;
EAT.CreateMarkdownConverter = CreateMarkdownConverter;
EAT.VanillaMarkdownLabel = VanillaMarkdownLabel;

import { PhraseDefinition, PhraseDefinitionView, PhraseDefinitionsView, PhraseDefinitionsController } from "./phrase-definition";
EAT.PhraseDefinition = PhraseDefinition;
EAT.PhraseDefinitionView = PhraseDefinitionView;
EAT.PhraseDefinitionsView = PhraseDefinitionsView;
EAT.PhraseDefinitionsController = PhraseDefinitionsController;

import { Page, PageView } from "./page";
EAT.Page = Page;
EAT.PageView = PageView;


import { PagesView, PagesController } from "./pages";
EAT.PagesView = PagesView;
EAT.PagesController = PagesController;

import { WidgetGalleryView } from "./widget-gallery";
EAT.WidgetGalleryView = WidgetGalleryView;

import "./eat";

import { SerializedData, RootSerializedData } from "./serialized-data";
EAT.SerializedData = SerializedData;
EAT.RootSerializedData = RootSerializedData;

import { CloseEmbeddedView, PostSubmitView, EditControlsView, EditSidebarView, CustomWidgetsView, PageFooterView, EditableWidgetView, WidgetViewWrapper } from "./eat-views";
EAT.CloseEmbeddedView = CloseEmbeddedView;
EAT.PostSubmitView = PostSubmitView;
EAT.EditControlsView = EditControlsView;
EAT.EditSidebarView = EditSidebarView;
EAT.CustomWidgetsView = CustomWidgetsView;
EAT.PageFooterView = PageFooterView;
EAT.EditableWidgetView = EditableWidgetView;
EAT.WidgetViewWrapper = WidgetViewWrapper;


import Elicitation from "./elicitation";
EAT.Elicitation = Elicitation;


import { Schema, SchemaProperty } from "./schema";
EAT.Schema = Schema;
EAT.SchemaProperty = SchemaProperty;


import { PropertyEditorView, PropertyEditors } from "./property-editor";
EAT.PropertyEditorView = PropertyEditorView;
EAT.PropertyEditors = PropertyEditors;

import { WidgetDefinition, WidgetDefinitionEditorView, WidgetDefinitionEditorCategoryView } from "./widget-definition";
EAT.WidgetDefinition = WidgetDefinition;
EAT.WidgetDefinitionEditorView = WidgetDefinitionEditorView;
EAT.WidgetDefinitionEditorCategoryView = WidgetDefinitionEditorCategoryView;


import { WidgetQualification, QualificationEditorView, qualifications } from "./widget-qualification"
EAT.WidgetQualification = WidgetQualification;
EAT.QualificationEditorView = QualificationEditorView;
EAT.qualifications = qualifications;


import { WidgetData, WidgetDataExplorer } from "./widget-data";
EAT.WidgetData = WidgetData;
EAT.WidgetDataExplorer = WidgetDataExplorer;

import Widget from "./widget"
EAT.Widget = Widget;