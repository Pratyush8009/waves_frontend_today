import { Routes } from '@angular/router';
import { UnitsPage } from './pages/units-page/units-page';
import { ModelPage } from './pages/model-page/modelpage';
import { SystemPage } from './pages/system-page/system-page';
import { Home } from './pages/home/home';
import { ConfigurePage } from './pages/configure-page/configure-page';
import { UnitPage } from './pages/unit-page/unit-page';
import { SystemOverview } from './components/system-details/system-overview/system-overview';
import { AnalysisPage } from './pages/analysis-page/analysis-page';
import { SystemConfig } from './components/system-details/system-config/system-config';
import { UnitOverview } from './components/unit-details/unit-overview/unit-overview';
import { UnitSystems } from './components/unit-details/unit-systems/unit-systems';
import { UnitManage } from './components/unit-details/unit-manage/unit-manage';
import { FileUpload } from './components/system-details/file-upload/file-upload';
import { UnitBilling } from './components/unit-details/unit-billing/unit-billing';
import { UnitSubscription } from './components/unit-details/unit-subscription/unit-subscription';
export const routes: Routes = [
    { path: 'units/:id', component: UnitsPage },

    {
        path: 'unit/:id/system/:systemId',
        component: SystemPage,
        children: [
            { path: 'model', component: ModelPage },
            { path: '', component: SystemOverview },
            { path: 'analysis', component: AnalysisPage },
            { path: 'manage', component: SystemConfig },
            { path: 'upload', component: FileUpload },

        ]
    },
    {
        path: 'user/:id/units/:unitId',
        component: UnitPage,
        children: [
            { path: '', component: UnitOverview },
            { path: 'systems', component: UnitSystems },
            { path: 'subscription', component: UnitSubscription },
            { path: 'configuration', component: UnitManage },
            { path: 'billings', component: UnitBilling },

        ]
    },

    // { path: 'user/:id/units/:unitId', component: UnitPage },


    { path: 'unit/system/subsystem/configure/:id', component: ConfigurePage },
    { path: '', component: Home },
];