import { useState } from "react"

import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

const PluginUse = (site) => {
    const [viewPlugin, setViewPlugin] = useState(false);

    return (
        <>
            <div className="site-card">
                <div className="site-card-details">
                    <p>{site.name}</p>
                    <div className="both-btns">
                        <a href={site.url} target="_blank" rel="noreferrer" className="btn">
                            View in MyKinsta
                        </a>
                        <button onClick={() => setViewPlugin(!viewPlugin)} className="btn" title="View Plugins">
                            {viewPlugin ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                    </div>
                </div>
                {viewPlugin && (
                    <div className="plugin-list">
                        {site.plugins.map((plugin, index) => {
                            return (
                                <div key={index} className="plugin-card">
                                    <p>{plugin.name}</p>
                                    <div className="plugin-version-info">
                                        <p>Current Version: {plugin.version}</p>
                                        <p>Latest Version: {plugin.update_version}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </>
    )
}

export default PluginUse