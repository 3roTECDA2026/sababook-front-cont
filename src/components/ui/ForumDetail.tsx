// src/components/ForumDetail.tsx
import useForumDetail from '@/hooks/useForumDetail';
import type { ForumDetail as ForumDetailType } from '@/types';

interface ForumDetailProps {
  foroId: number | string | undefined;
  onClose: () => void;
}

type ForumDetailData = ForumDetailType & {
  creador?: { nombre?: string };
  usuario_nombre?: string;
};

const ForumDetail = ({ foroId, onClose }: ForumDetailProps) => {
  const { forum, loading, error } = useForumDetail(foroId);
  const foroData = forum as ForumDetailData | null;

  if (!foroId) return null;
  if (loading) return <p>Cargando foro...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!foroData) return <p>No se encontró el foro.</p>;

  return (
    <div>
      <h2>{foroData?.title || (foroData as any)?.titulo || 'Foro sin título'}</h2>
      <p>{foroData?.description || (foroData as any)?.descripcion || 'Sin descripción'}</p>
      <p>
        <strong>Creador:</strong>{' '}
        {foroData?.creatorName || (foroData as any)?.creador?.nombre || (foroData as any)?.usuario_nombre || 'Desconocido'}
      </p>
      {/* Aquí puedes agregar la lógica para mostrar comentarios si lo deseas */}
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default ForumDetail;