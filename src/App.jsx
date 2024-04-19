import { useEffect, useState } from "react"
import KinstaLogo from './assets/kinsta-logo.png'

import PluginPage from './components/PluginsPage'
import Footer from './components/Footer'

function App() {
  const [sitesWithPluginUpdate, setSitesWithPluginUpdate] = useState(0);
  const [sitesWithOutdatedPlugin, setSitesWithOutdatedPlugin] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  const KinstaAPIUrl = 'https://api.kinsta.com/v2';

  const getSitesWithPluginData = async () => {
    const getListOfCompanySites = async () => {
      const query = new URLSearchParams({
        company: import.meta.env.VITE_KINSTA_COMPANY_ID,
      }).toString();

      const resp = await fetch(`${KinstaAPIUrl}/sites?${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_KINSTA_API_KEY}`,
        },
      });

      const data = await resp.json();
      const companySites = data.company.sites;

      return companySites;
    }

    const companySites = await getListOfCompanySites();

    // Get all environments for each site
    const sitesEnvironmentData = companySites.map(async (site) => {
      const siteId = site.id;

      const resp = await fetch(`${KinstaAPIUrl}/sites/${siteId}/environments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_KINSTA_API_KEY}`,
        },
      });

      const data = await resp.json();
      const environments = data.site.environments;

      return {
        id: siteId,
        name: site.display_name,
        environments: environments,
      };
    });

    // Wait for all the promises to resolve
    const sitesData = await Promise.all(sitesEnvironmentData);

    // Get all plugins for each environment
    const sitesWithPlugin = sitesData.map(async (site) => {
      const environmentId = site.environments[0].id;

      const resp = await fetch(
        `${KinstaAPIUrl}/sites/environments/${environmentId}/plugins`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_KINSTA_API_KEY}`,
          },
        }
      );

      const data = await resp.json();
      const plugins = data.environment.container_info;

      return {
        env_id: environmentId,
        name: site.name,
        site_id: site.id,
        plugins: plugins,
      };
    });

    // Wait for all the promises to resolve
    const sitesWithPluginData = await Promise.all(sitesWithPlugin);
    return sitesWithPluginData;
  }

  useEffect(() => {
    const checkSitesWithPluginUpdate = async () => {
      const sitesWithPluginData = await getSitesWithPluginData();

      const sitesWithOutdatedPlugin = sitesWithPluginData.map((site) => {
        const plugins = site.plugins.wp_plugins.data;
        const outdatedPlugins = plugins.filter((plugin) => plugin.update === "available");

        if (outdatedPlugins.length > 0) {
          const kinstaDashboardPluginPageURL = `https://my.kinsta.com/sites/plugins/${site.site_id}/${site.env_id}?idCompany=${import.meta.env.VITE_KINSTA_COMPANY_ID}`;
          return {
            name: site.name,
            plugins: outdatedPlugins,
            url: kinstaDashboardPluginPageURL,
          };
        }
      });

      setSitesWithOutdatedPlugin(sitesWithOutdatedPlugin);

      // get number of sites that have plugin update
      const sitesWithPluginUpdate = sitesWithPluginData.filter((site) => site.plugins.wp_plugins.data.filter((plugin) => plugin.update === "available").length > 0);
      setSitesWithPluginUpdate(sitesWithPluginUpdate.length);
      setIsLoading(false);
    }

    const getCurrentTab = async () => {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      setActiveTab(tab);
    }

    getCurrentTab();
    checkSitesWithPluginUpdate()
  }, []);


  return (
    <div className="container">
      {activeTab?.url.includes('my.kinsta.com') ? (
        <div >
          <div className="title-section">
            <img src={KinstaLogo} className="logo" alt="" />
          </div>
          <p className="info-box">
            Get quick information about your site plugins that need update.
          </p>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="content">
                <p>The following {sitesWithPluginUpdate} sites have plugins that need to be updated.</p>


                {sitesWithOutdatedPlugin.map((site, index) => {
                  return (
                    <PluginPage key={index} {...site} />
                  );
                })}
              </div >
            </>
          )}

        </div >
      ) : (
        <div >
          <div className="title-section">
            <img src={KinstaLogo} className="logo" alt="" />
          </div>
          <p className="info-box">
            This extension is only available on Kinsta Dashboard.
          </p>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default App
