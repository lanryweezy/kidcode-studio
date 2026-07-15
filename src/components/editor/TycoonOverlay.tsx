import React from 'react';
import type { useEditorController } from '../../hooks/useEditorController';

type ControllerProps = ReturnType<typeof useEditorController>;

interface TycoonOverlayProps {
    activeTycoonGame: ControllerProps['activeTycoonGame'];
    setActiveTycoonGame: ControllerProps['setActiveTycoonGame'];
}

const StockMarketTycoon = React.lazy(() => import('../game/StockMarketTycoon').then(m => ({ default: m.StockMarketTycoon })));
const ShopManagementGame = React.lazy(() => import('../game/ShopManagementGame').then(m => ({ default: m.ShopManagementGame })));
const HotelManagementGame = React.lazy(() => import('../game/HotelManagementGame').then(m => ({ default: m.HotelManagementGame })));
const StartupSimulatorGame = React.lazy(() => import('../game/StartupSimulatorGame').then(m => ({ default: m.StartupSimulatorGame })));
const LogisticsGame = React.lazy(() => import('../game/LogisticsGame').then(m => ({ default: m.LogisticsGame })));
const MallTycoonGame = React.lazy(() => import('../game/MallTycoonGame').then(m => ({ default: m.MallTycoonGame })));
const ThemeParkTycoonGame = React.lazy(() => import('../game/ThemeParkTycoonGame').then(m => ({ default: m.ThemeParkTycoonGame })));
const CinemaTycoonGame = React.lazy(() => import('../game/CinemaTycoonGame').then(m => ({ default: m.CinemaTycoonGame })));
const RailwayTycoonGame = React.lazy(() => import('../game/RailwayTycoonGame').then(m => ({ default: m.RailwayTycoonGame })));
const ShippingTycoonGame = React.lazy(() => import('../game/ShippingTycoonGame').then(m => ({ default: m.ShippingTycoonGame })));
const OilCompanyTycoonGame = React.lazy(() => import('../game/OilCompanyTycoonGame').then(m => ({ default: m.OilCompanyTycoonGame })));
const ManufacturingTycoonGame = React.lazy(() => import('../game/ManufacturingTycoonGame').then(m => ({ default: m.ManufacturingTycoonGame })));
const BankSimulatorGame = React.lazy(() => import('../game/BankSimulatorGame').then(m => ({ default: m.BankSimulatorGame })));

const TycoonOverlay: React.FC<TycoonOverlayProps> = React.memo(({ activeTycoonGame, setActiveTycoonGame }) => {
    if (!activeTycoonGame) return null;

    const exit = () => setActiveTycoonGame(null);

    return (
        <div className="fixed inset-0 z-[200]">
            <React.Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
                </div>
            }>
                {activeTycoonGame === 'stock_market' && <StockMarketTycoon onExit={exit} />}
                {activeTycoonGame === 'shop_management' && <ShopManagementGame onExit={exit} />}
                {activeTycoonGame === 'hotel' && <HotelManagementGame onExit={exit} />}
                {activeTycoonGame === 'startup' && <StartupSimulatorGame onExit={exit} />}
                {activeTycoonGame === 'logistics' && <LogisticsGame onExit={exit} />}
                {activeTycoonGame === 'mall' && <MallTycoonGame onExit={exit} />}
                {activeTycoonGame === 'theme_park' && <ThemeParkTycoonGame onExit={exit} />}
                {activeTycoonGame === 'cinema' && <CinemaTycoonGame onExit={exit} />}
                {activeTycoonGame === 'railway' && <RailwayTycoonGame onExit={exit} />}
                {activeTycoonGame === 'shipping' && <ShippingTycoonGame onExit={exit} />}
                {activeTycoonGame === 'oil' && <OilCompanyTycoonGame onExit={exit} />}
                {activeTycoonGame === 'manufacturing' && <ManufacturingTycoonGame onExit={exit} />}
                {activeTycoonGame === 'bank' && <BankSimulatorGame onExit={exit} />}
            </React.Suspense>
        </div>
    );
});

TycoonOverlay.displayName = 'TycoonOverlay';
export default TycoonOverlay;
