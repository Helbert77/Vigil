import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { Navigate } from 'react-router-dom';
import { AnalyticsDashboard } from '../src/components/admin/AnalyticsDashboard';
import CouponManagement from '../src/components/admin/CouponManagement';
import Card from '../components/common/Card';

const Admin: React.FC = () => {
  const { session, user } = useSession();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'content' | 'coupons'>('analytics');

  // Verificar se o usuário é admin
  // TODO: Adicionar verificação de role admin no banco de dados
  const isAdmin = user?.email === 'admin@vigil.com' || user?.role === 'admin';

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta área.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              🛡️ Painel de Administração
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie e monitore a plataforma Vigil
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'analytics'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'users'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              👥 Usuários
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'content'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📝 Conteúdo
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'coupons'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🎟️ Cupons
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        
        {activeTab === 'users' && (
          <div className="p-4 md:p-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Gerenciamento de Usuários
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Em desenvolvimento...
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="p-4 md:p-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Moderação de Conteúdo
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Em desenvolvimento...
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="p-4 md:p-6">
            <CouponManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

