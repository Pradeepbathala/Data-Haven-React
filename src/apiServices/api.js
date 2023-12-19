import api from "./services";

// Login API's
const checkBlockedUser = (payload) =>
  api.get(
    `/login_auth_user_locked?account_name=${payload.account_name}&user=${payload.user}`
  );
const getAuthorisationApi = (payload) =>
  api.get(
    `/login_auth?account_name=${payload.account_name}&user=${payload.user}&password=${payload.password}`
  );
const getAuthorisedUserDetailsApi = (payload) =>
  api.get(
    `/login_auth_user?account_name=${payload.account_name}&user=${payload.user}`
  );
const getAdminPartyAccountApi = (payload) =>
  api.get(
    `/login_get_user?account_name=${payload.account_name}&user=${payload.user}`
  );

// Forgot Password
const getUserData = (payload) =>
  api.get(
    `/get_user_data?account_name=${payload.account_name}&userName=${payload.user_name}`
  );
const getUserNameFromEmail = (payload) =>
  api.get(
    `/get_username_from_email?account_name=${payload.account_name}&email=${payload.email_id}`
  );

const mailtoadmin = (payload) =>
  api.get(
    `/mailtoadmin?mailusedfor=${payload.mailusedfor}&recipient=${payload.recipient}&user_name=${payload.user_name}&password=${payload.password}&email_id=${payload.email_id}&fullName=${payload.fullName}&company=${payload.company}&designation=${payload.designation}&snowflake_account=${payload.snowflake_account}`
  );

// Register
const getAllUsernames = (payload) =>
  api.get(
    `/count_all_users?account_name=${payload.account_name}&user=${payload.user}`
  );
const registerUser = (payload) =>
  api.get(
    `/register_user?account_name=${payload.account_name}&full_name=${payload.full_name}&company=${payload.company}&designation=${payload.designation}&email_id=${payload.email_id}&snowflake_account=${payload.snowflake_account}&userName=${payload.userName}&password=${payload.password}`
  );

// Home Page API's
const getAllUsers = (account_name) =>
  api.get(`/home_page_users?account_name=${account_name}`);
const getLatestPartners = (payload) =>
  api.get(
    `/home_page?account_name=${payload.account_name}&party_account=${payload.party_account}&column_1=${payload.column_1}&column_2=${payload.column_2}`
  );
const getAllProviders = (account_name) =>
  api.get(`/home_page_provider?account_name=${account_name}`);

// Match Rate and Enrichment common API

const enrichmentCustomerSampleView = (payload) =>
  api.get(
    `/enrichment_customer_sample_view?account_name=${payload.account_name}&consumer_database_name1=${payload.db_name}`
  );
const getAllProvidersList = (payload) =>
  api.get(
    `/provider_list?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}`
  );
const fetchData = (payload) =>
  api.get(
    `/fetch_requests?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}&template_name=${payload.template_name}`
  );
const getTemplateStatus = (payload) =>
  api.get(
    `/get_template_status_match_rate?account_name=${payload.account_name}&consumer_database_name2=${payload.db_name}&template_name=${payload.template_name}&consumer_name=${payload.consumer_name}`
  );
const downloadFileAPI = (payload) =>
  api.get(
    `/download_request_data?account_name=${payload.account_name}&templateName=${payload.templateName}&run_id=${payload.run_id}&consumer_database_name=${payload.db_name}`
  );
const viewSampleData = (payload) =>
  api.get(
    `/view_sample_data?account_name=${payload.account_name}&templateName=${payload.templateName}&run_id=${payload.run_id}&consumer_database_name=${payload.db_name}`
  );

const callProcedureMatchRate = (payload) =>
  api.get(
    `/call_procedure?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}`
  );

const getRequestDataUsingRunId = (payload) =>
  api.get(
    `/get_request_runId?account_name=${payload.account_name}&newReqId=${payload.newReqId}&consumer_database_name=${payload.db_name}&template_name=${payload.template_name}`
  );

const insertLogTableData = (payload) =>
  api.get(
    `/insert_log_table_data?account_name=${payload.account_name}&RUN_ID=${payload.RUN_ID}&TEMPLATE_NAME=${payload.TEMPLATE_NAME}&CONSUMER_RECORD_COUNT=${payload.CONSUMER_RECORD_COUNT}&PROVIDER_NAME=${payload.PROVIDER_NAME}&CONSUMER_NAME=${payload.CONSUMER_NAME}&REQUEST_TS=${payload.REQUEST_TS}&STATUS=${payload.STATUS}`
  );

const getProviderAccount = (payload) =>
  api.get(
    `/get_provider_account?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}&provider_name=${payload.provider_name}`
  );

const getSnowflakeTables = (payload) =>
  api.get(
    `/sf_table_list?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}`
  );
const getIdentifierTypes = (payload) =>
  api.get(
    `/get_column_list?account_name=${payload.account_name}&provider_name=${payload.provider_name}&consumer_name=${payload.consumer_name}&provider_database_name=${payload.db_name}`
  );
const getMatchAttributes = (payload) =>
  api.get(
    `/fetch_match_attributes?account_name=${payload.account_name}&provider_name=${payload.provider_name}&consumer_name=${payload.consumer_name}&provider_database_name=${payload.db_name}`
  );
const getMatchAttributesStatus = (payload) =>
  api.get(
    `/count_match_attribute_status?account_name=${payload.account_name}&provider_name=${payload.provider_name}&consumer_name=${payload.consumer_name}&provider_database_name=${payload.db_name}`
  );

// MAtch Rate API

const attachment = (payload) =>
  api.get(
    `/attachment?account_name=${payload.account_name}&filename=${payload.filename}&identifyer=${payload.identifyer}&db_name=${payload.db_name}`
  );

const insertMatchRateRequest = (payload) =>
  api.get(
    `/insert_request_data_match_rate?account_name=${payload.account_name}&template_name=${payload.template_name}&provider_name=${payload.provider_name}&columns=${payload.columns}&consumer_name=${payload.consumer_name}&run_id=${payload.run_id}&file_name=${payload.file_name}&attribute_name=${payload.attribute_name}&attribute_value=${payload.attribute_value}&consumer_database_name=${payload.consumer_database_name}&tag=${payload.tag}`
  );

const insertRunId = (payload) =>
  api.get(
    `/insert_RUNID?account_name=${payload.account_name}&run_id=${payload.run_id}&provider_database_name=${payload.db_name}`
  );

const viewRequestDataMatchRate = (payload) =>
  api.get(
    `/view_request_data?account_name=${payload.account_name}&templateName=${payload.templateName}&run_id=${payload.run_id}&consumer_database_name=${payload.consumer_database_name}`
  );

const queryRequests = (payload) =>
  api.get(
    `/Query_Requests?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}&run_id=${payload.run_id}`
  );

const insert_requestUplToClientSpace = (payload) =>
  api.get(
    `/insert_request_upl_to_client_space?account_name=${payload.account_name}&template_name=${payload.template_name}&provider_name=${payload.provider_name}&columns=${payload.columns}&consumer_name=${payload.consumer_name}&run_id=${payload.run_id}&file_name=${payload.file_name}&attribute_name=${payload.attribute_name}&attribute_value=${payload.attribute_value}&consumer_database_name=${payload.consumer_database_name}&tag=${payload.tag}`
  );

const updateDashboardTableStatus = (payload) =>
  api.get(
    `/update_dashboard_table_status?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}&run_id=${payload.run_id}`
  );

const callMatchedDataProcedure = (payload) =>
  api.get(
    `/call_matched_data_procedure?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}`
  );

const callProcedureAnalytics = (payload) =>
  api.get(
    `/call_procedure_analytics?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}&run_id=${payload.newReqId}`
  );

// Enrichment Page API's

const getAllowedColumns = (payload) =>
  api.get(
    `/Enrichment_allowed_columns?account_name=${payload.account_name}&databaseName=${payload.databaseName}&Query_Name=${payload.Query_Name}`
  );
const getDatabaseName = (payload) =>
  api.get(
    `/get_database_name?account_name=${payload.account_name}&selectedProvider=${payload.selectedProvider}&consumer_database_name=${payload.consumer_database_name}`
  );
const getTemplateNames = (payload) =>
  api.get(
    `/get_template_name?account_name=${payload.account_name}&databaseName=${payload.databaseName}`
  );

const insertEnrichmentRequest = (payload) =>
  api.get(
    `/insert_request_data_enrichment?account_name=${payload.account_name}&template_name=${payload.template_name}&provider_name=${payload.provider_name}&columns=${payload.columns}&consumer_name=${payload.consumer_name}&run_id=${payload.run_id}&attribute_value=${payload.attribute_value}&consumer_database_name=${payload.consumer_database_name}`
  );

//campaign API's

const fetchingLinkedinCampaignGroups = (payload) =>
  api.get(
    `/fetching_linkedin_campaign_groups?account_name=${payload.account_name}`
  );

const fetchingLinkedinCampaign = (payload) =>
  api.get(
    `/fetching_linkedin_campaign?account_name=${payload.account_name}&campaign_group_id=${payload.campaign_group_id}`
  );

const fetchingLinkedinCreativeAd = (payload) =>
  api.get(
    `/fetching_linkedin_creative_ad?account_name=${payload.account_name}&campaign_id=${payload.campaign_id}`
  );

const uploadLinkedinAudience = (payload) =>
  api.get(
    `/upload_linkedin_audience?account_name=${payload.account_name}&templateName=${payload.templateName}&linkedin_account_name=${payload.linkedin_account_name}&run_id=${payload.run_id}&consumer_database_name=${payload.consumer_database_name}`
  );

const updateCampaignWithAudienceList = (payload) =>
  api.get(
    `/update_campaign_with_audience_list?account_name=${payload.account_name}&campaign_id=${payload.campaign_id}&run_id=${payload.run_id}`
  );

const activateLinkedinCampaign = (payload) =>
  api.get(
    `/activate_linkedin_campaign?account_name=${payload.account_name}&campaign_id=${payload.campaign_id}`
  );

const deActivateLinkedinCampaign = (payload) =>
  api.get(
    `/de_activate_linkedin_campaign?account_name=${payload.account_name}&campaign_id=${payload.campaign_id}`
  );

// Status page API's

const getAllRequestData = (payload) =>
  api.get(
    `/get_all_requests?account_name=${payload.account_name}&consumer_database_name=${payload.db_name}`
  );

const filterStatusTable = (payload) =>
  api.get(
    `/filter_table?account_name=${payload.account_name}&providerNames=${payload.providerNames}&templateNames=${payload.templateNames}&statuses=${payload.statuses}&date=${payload.date}`
  );

// Admin Console API's
const fetchUserProfileIntegration = (payload) =>
  api.get(`/fetch_user_profile?account_name=${payload.account_name}`);
const updateUserProfile = (payload) =>
  api.get(
    `/admin_console_update_profile?account_name=${payload.account_name}&role=${payload.role}&status=${payload.status}&userName=${payload.userName}&provider_database_name=${payload.provider_database_name}`
  );
const getConsumerName = (payload) =>
  api.get(
    `/get_consumer?account_name=${payload.account_name}&provider_database_name=${payload.provider_database_name}`
  );
const getTemplates = (payload) =>
  api.get(
    `/get_templates?account_name=${payload.account_name}&user=${payload.user}&provider_database_name=${payload.provider_database_name}`
  );
const getAllowedColumnsConsole = (payload) =>
  api.get(
    `/get_allowed_columns?account_name=${payload.account_name}&user=${payload.user}&template_name=${payload.template_name}&provider_database_name=${payload.provider_database_name}`
  );
const getAllColumnsConsole = (payload) =>
  api.get(
    `/get_all_columns?account_name=${payload.account_name}&user=${payload.user}&template_name=${payload.template_name}&provider_database_name=${payload.provider_database_name}`
  );
const fetchAllowedColumnStatus = (payload) =>
  api.get(
    `/fetch_allowed_column_status?account_name=${payload.account_name}&user=${payload.user}&template_name=${payload.template_name}&column_name=${payload.column_name}&provider_database_name=${payload.provider_database_name}`
  );
const updateAllowedColumns = (payload) =>
  api.get(
    `/insert_allowed_column_data?account_name=${payload.account_name}&provider_database_name=${payload.db_name}&result=${payload.result}`
  );
const procedureUpdateAllowedColumns = (payload) =>
  api.get(
    `/procedure_templates?account_name=${payload.account_name}&provider_database_name=${payload.provider_database_name}`
  );

const fetchUserProfile = (payload) =>
  api.get(
    `/fetch_user_profile?account_name=${payload.account_name}&role=${payload.role}`
  );

// Itemised Bills
const fetchTemplateStatus = (payload) =>
  api.get(
    `/get_template_status?account_name=${payload.account_name}&user=${payload.user}&template_name=${payload.template_name}&provider_database_name=${payload.provider_database_name}`
  );
const updateTemplates = (payload) =>
  api.get(
    `/update_template?account_name=${payload.account_name}&user=${payload.user}&template_name=${payload.template_name}&template_status=${payload.status}&provider_database_name=${payload.provider_database_name}`
  );
const getConsumerAdmin = (payload) =>
  api.get(
    `/get_consumer_itemised_bills?account_name=${payload.account_name}&provider_database_name=${payload.provider_database_name}`
  );

// Analytics

const getAnalyticsData = (payload) =>
  api.get(
    `/analytics?account_name=${payload.account_name}&run_id=${payload.run_id}&consumer_database_name=${payload.db_name}`
  );

// Meta Ads

const getAnalyticsReport = (payload) =>
  api.get(
    `/analysis_report?account_name=${payload.account_name}&run_id=${payload.run_id}`
  );
const getAnalyticsLogsReport = (payload) =>
  api.get(
    `/analysis_log_report?account_name=${payload.account_name}&run_id=${payload.run_id}`
  );
const fetch_campaigns = (payload) =>
  api.get(`/fetching_campaign?account_name=${payload.account_name}`);

const display_logs = (payload) =>
  api.get(
    `/display_adlog?account_name=${payload.account_name}&run_id=${payload.run_id}`
  );

const uploadAudience = (payload) =>
  api.get(
    `/fetch_sf_ads_data?account_name=${payload.account_name}&run_id=${payload.run_id}&templateName=${payload.templateName}&campaign_id=${payload.campaign_id}&consumer_database_name=${payload.consumer_database_name}`
  );

const publishMetaAds = (payload) =>
  api.get(
    `/publishads_meta?account_name=${payload.account_name}&run_id=${payload.run_id}&campaign_id=${payload.campaign_id}`
  );

const stopMetaAds = (payload) =>
  api.get(
    `/stoppingads_meta?account_name=${payload.account_name}&run_id=${payload.run_id}&campaign_id=${payload.campaign_id}`
  );

const API = {
  checkBlockedUser,
  getAuthorisationApi,
  getAuthorisedUserDetailsApi,
  getAdminPartyAccountApi,

  getAllUsernames,
  registerUser,

  getAllUsers,
  getLatestPartners,
  getAllProviders,

  getUserData,
  getUserNameFromEmail,
  mailtoadmin,

  //common
  getAllProvidersList,
  fetchData,
  viewSampleData,
  downloadFileAPI,
  enrichmentCustomerSampleView,

  //Match Rate
  getTemplateStatus,
  callProcedureMatchRate,
  getRequestDataUsingRunId,
  insertLogTableData,
  attachment,
  getProviderAccount,
  insertMatchRateRequest,
  insertRunId,
  viewRequestDataMatchRate,
  queryRequests,
  insert_requestUplToClientSpace,
  updateDashboardTableStatus,
  callMatchedDataProcedure,
  callProcedureAnalytics,

  getSnowflakeTables,
  getIdentifierTypes,
  getMatchAttributes,
  getMatchAttributesStatus,

  // Enrichment
  getAllowedColumns,
  getDatabaseName,
  getTemplateNames,
  insertEnrichmentRequest,

  // Status
  getAllRequestData,
  filterStatusTable,

  // Admin Console
  fetchUserProfileIntegration,
  fetchUserProfile,
  updateUserProfile,
  getConsumerName,
  getTemplates,
  getAllowedColumnsConsole,
  getAllColumnsConsole,
  fetchAllowedColumnStatus,
  updateAllowedColumns,
  procedureUpdateAllowedColumns,
  getConsumerAdmin,
  fetchTemplateStatus,
  updateTemplates,

  // Analytics
  getAnalyticsData,

  // Meta Ad's
  getAnalyticsReport,
  getAnalyticsLogsReport,
  fetch_campaigns,
  display_logs,
  uploadAudience,
  publishMetaAds,
  stopMetaAds,

  //campaign API's

  fetchingLinkedinCampaignGroups,
  fetchingLinkedinCampaign,
  fetchingLinkedinCreativeAd,
  uploadLinkedinAudience,
  updateCampaignWithAudienceList,
  activateLinkedinCampaign,
  deActivateLinkedinCampaign,
};

export default API;
