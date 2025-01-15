import TrashIcon from '@mui/icons-material/Delete';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { LOCAL_STORAGE_PREFIX } from '@/lib/const';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Profile, UserWithIcon } from '@/types/supabase';
import { supabaseClient } from '@/lib/supabaseClient';

type Props = {
  user: UserWithIcon;
};

export const ProfilePage: FC<Props> = ({ user }) => {
  const router = useNavigate();
  const [isCheckLogOut, setIsCheckLogOut] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserWithIcon>(user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dialogTarget, setDialogTarget] = useState<string>('');
  const [dialogInput, setDialogInput] = useState('');
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);

  useEffect(() => {
    const userId = user.id;

    (async () => {
      const res = await supabaseClient.from('profiles').select('*').eq('id', userId);
      if (!res.data) return;

      const profile = res.data[0];
      setProfile(profile);

      const photos = await supabaseClient.from('profile_photos').select('*').eq('id', userId);
      if (!photos.data) return;

      const photoIds = photos.data.map((photo) => photo.img_id);
      const photoUrls = (await Promise.all(
        photoIds.map(async (id) => {
          const res = await supabaseClient.from('photos').select('img_url').eq('id', id);
          return res.data?.[0]?.img_url;
        })
      ).then((urls) => urls.filter((url) => url))) as string[];

      setProfilePhotos(photoUrls);
    })();
  }, [user.id]);

  const onSave = async () => {
    if (!profile) return;

    const userPromise = supabaseClient
      .from('users')
      .update({
        nickname: editUser.nickname,
      })
      .eq('id', user.id);
    const profilePromise = supabaseClient.from('profiles').upsert(profile);
    await Promise.all([userPromise, profilePromise]);

    setIsEdit(false);

    router('/profile');
  };

  const ref = useRef(null);

  const uploadPhotos = async (inputPhotos: File[] = []) => {
    const photoPaths = await Promise.all(
      inputPhotos.map(async (photo) => {
        const { data } = await supabaseClient.storage
          .from('photos')
          .upload(`profile/${user.id}/${Math.random()}`, photo);

        return data?.path;
      })
    );

    const urls = await Promise.all(
      photoPaths.map(async (path) => {
        const res = supabaseClient.storage.from('photos').getPublicUrl(path ?? '');
        return res.data?.publicUrl;
      })
    );

    await supabaseClient.from('photos').insert(urls.map((url) => ({ img_url: url })));

    const data2 = await supabaseClient.from('photos').select('id').in('img_url', urls);

    await Promise.all([
      supabaseClient.from('profile_photos').insert(
        data2.data?.map((photo) => ({
          id: user.id,
          img_id: photo.id,
        })) ?? []
      ),
    ]);

    setProfilePhotos([...profilePhotos, ...urls.filter((url) => url)]);
  };

  const [deleteTargetPhotoIndex, setDeleteTargetPhotoIndex] = useState<string>('');

  return (
    <>
      <Modal
        open={Boolean(deleteTargetPhotoIndex)}
        onClose={() => setDeleteTargetPhotoIndex('')}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100dvw - 25px)',
          boxShadow: 24,
          m: 0,
          borderRadius: '15px',
          overflowY: 'auto',
          bgcolor: 'white',
          zIndex: 5,
          height: 'fit-content',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            p: 3,
            py: 5,
            pt: 3.5,
            bgcolor: 'white',
            height: 'fit-content',
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 'bold' }}>画像を削除しますか？</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: '100%',
              justifyContent: 'stretch',
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDeleteTargetPhotoIndex('');
              }}
              sx={{
                width: '100%',
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                const targetIndex = parseInt(deleteTargetPhotoIndex);
                const targetPhoto = profilePhotos[targetIndex];
                const targetPhotoId = (
                  await supabaseClient.from('photos').select('id').eq('img_url', targetPhoto)
                ).data?.[0]?.id;

                if (!targetPhotoId) return;

                await supabaseClient.from('profile_photos').delete().eq('img_id', targetPhotoId);

                const newPhotos = profilePhotos.filter((_, index) => index !== targetIndex);
                setProfilePhotos(newPhotos);
                setDeleteTargetPhotoIndex('');
              }}
              sx={{
                fontWeight: 'bold',
                color: 'white',
                width: '100%',
              }}
            >
              削除する
            </Button>
          </Stack>
        </Stack>
      </Modal>
      <input
        type="file"
        ref={ref}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={async (e) => {
          if (!e.target.files) return;
          await uploadPhotos(Array.from(e.target.files));
        }}
      />
      <HeaderLayout withHome label="プロフィール">
        <Stack sx={{ pt: 1, pb: 3 }} spacing={1}>
          <Stack
            sx={{
              width: '100%',
              p: 3,
              py: 1,
              borderRadius: '10px',
              background: `linear-gradient(to top right, rgba(217, 175, 217, 0.7) 0%, rgba(151, 217, 225, 0.7) 100%),url(${user.icon})`,
            }}
          >
            <Avatar src={user.icon} sx={{ width: '65px', height: '65px', margin: 'auto' }} />
          </Stack>
          <Stack
            sx={{ pt: 1, pb: 1.5, width: '100%' }}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Typography sx={{ fontWeight: 'bold' }}>写真</Typography>
          </Stack>
          <Box height={'200px'} />
          <Stack
            sx={{
              width: '95dvw',
              position: 'absolute',
              top: '195px',
              overflowX: 'auto',
              pt: 0.5,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Stack
                sx={{
                  width: '200px',
                  height: '200px',
                  aspectRatio: '1/1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#f0f0f0',
                  borderRadius: '10px',
                  border: '1px dashed gray',
                }}
              >
                <Button
                  sx={{ p: 0, height: '100%', width: '100%' }}
                  onClick={() => {
                    if (!ref.current) return;
                    // @ts-ignore
                    ref.current?.click();
                  }}
                >
                  <AddAPhotoIcon
                    sx={{
                      height: '50px',
                      width: '50px',
                    }}
                  />
                </Button>
              </Stack>
              {profilePhotos.length > 0 &&
                profilePhotos.map((photo, index) => (
                  <Stack
                    key={`${photo}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      index
                    }`}
                    sx={{
                      width: '200px',
                      height: '200px',
                      aspectRatio: '1/1',
                    }}
                  >
                    <Button
                      sx={{ p: 0 }}
                      disabled
                      // onClick={() => console.log('clicked')}
                    >
                      <img
                        alt="profile"
                        src={photo}
                        style={{
                          height: '100%',
                          width: '100%',
                          borderRadius: '10px',
                          aspectRatio: '1/1',
                          objectFit: 'cover',
                        }}
                      />
                    </Button>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 10,
                        transform: 'translate(150px, 0)',
                        bgcolor: 'white',
                        '&:hover': {
                          bgcolor: 'white',
                        },
                      }}
                      onClick={() => {
                        setDeleteTargetPhotoIndex(index.toString());
                      }}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Stack>
                ))}
            </Stack>
          </Stack>
          <Stack
            sx={{ pt: 1, pb: 1.5, width: '100%' }}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Typography sx={{ fontWeight: 'bold' }}>自己紹介</Typography>
            <Button
              variant="contained"
              disabled={!isEdit}
              sx={{ color: 'white', fontWeight: 'bold' }}
              size="small"
              onClick={onSave}
            >
              保存
            </Button>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={profile?.introduction ?? ''}
            onChange={(e) => {
              setIsEdit(true);
              setProfile({ ...profile, introduction: e.target.value } as Profile);
            }}
          />
          <Typography sx={{ fontWeight: 'bold' }}>SNS</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<InstagramIcon />}
              sx={{
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'left',
                borderColor: 'gray',
                borderWidth: '0.9px',
                px: 2,
                overflow: 'hidden',
              }}
              onClick={() => {
                setDialogTarget('instagram');
                setDialogInput(profile?.instagram ?? '');
              }}
            >
              {profile?.instagram ?? '未設定'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<XIcon />}
              sx={{
                color: 'black',
                fontWeight: 'bold',
                borderColor: 'gray',
                borderWidth: '0.9px',
                px: 2,
                overflow: 'hidden',
              }}
              onClick={() => {
                setDialogTarget('twitter');
                setDialogInput(profile?.twitter ?? '');
              }}
            >
              {profile?.twitter ?? '未設定'}
            </Button>
          </Stack>
          <Stack
            sx={{ pt: 1, pb: 1.5, width: '100%' }}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography sx={{ fontWeight: 'bold' }}>基本項目</Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              ニックネーム
            </Typography>
            <Stack>
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                value={
                  isEdit || editUser.nickname !== user.nickname ? editUser.nickname : user.nickname
                }
                onChange={(e) => {
                  setIsEdit(true);
                  setEditUser({ ...editUser, nickname: e.target.value });
                }}
              />
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              MBTI
            </Typography>
            <Stack>
              <Select
                value={profile?.personal_types ?? '未選択'}
                size="small"
                onChange={(e) => {
                  setIsEdit(true);
                  setProfile({ ...profile, personal_types: e.target.value } as Profile);
                }}
              >
                {[
                  'ESTP（起業家）',
                  'ESFP（エンターテイナー）',
                  'ENTP（討論者）',
                  'ENFP（広報担当者）',
                  'ESTJ（幹部）',
                  'ESFJ（領事館員）',
                  'ENTJ（指揮官）',
                  'ENFJ（主人公）',
                  'ISTP（職人）',
                  'ISFP（冒険者）',
                  'INTP（論理学者）',
                  'INFP（仲介者）',
                  'ISTJ（現実主義者）',
                  'ISFJ（擁護者）',
                  'INTJ（建築家）',
                  'INFJ（提唱者）',
                  '未選択',
                ].map((type) => (
                  <MenuItem value={type} key={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              血液型
            </Typography>
            <Stack>
              <Select
                value={profile?.blood_type ?? '未選択'}
                size="small"
                onChange={(e) => {
                  setIsEdit(true);
                  setProfile({ ...profile, blood_type: e.target.value } as Profile);
                }}
              >
                {['A型', 'B型', 'O型', 'AB型', '未選択'].map((type) => (
                  <MenuItem value={type} key={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              居住地
            </Typography>
            <Stack>
              <Select
                value={profile?.address ?? '未選択'}
                size="small"
                onChange={(e) => {
                  setIsEdit(true);
                  setProfile({ ...profile, address: e.target.value } as Profile);
                }}
              >
                <MenuItem value={'岐阜県'}>岐阜県</MenuItem>
                <MenuItem value={'三重県'}>三重県</MenuItem>
                <MenuItem value={'愛知県'}>愛知県</MenuItem>
                <MenuItem value={'未選択'}>未選択</MenuItem>
              </Select>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              学校
            </Typography>
            <Stack>
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                value={profile?.school ?? ''}
                onChange={(e) => {
                  setIsEdit(true);
                  setEditUser({ ...editUser, nickname: e.target.value });
                }}
              />
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              タバコ
            </Typography>
            <Stack>
              <Select
                value={profile?.cigarettes ?? '未選択'}
                size="small"
                onChange={(e) => {
                  setIsEdit(true);
                  setProfile({ ...profile, cigarettes: e.target.value } as Profile);
                }}
              >
                <MenuItem value={'吸う'}>吸う</MenuItem>
                <MenuItem value={'吸わない'}>吸わない</MenuItem>
                <MenuItem value={'未選択'}>未選択</MenuItem>
              </Select>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
              お酒
            </Typography>
            <Select
              value={profile?.alcohol ?? '未選択'}
              size="small"
              onChange={(e) => {
                setIsEdit(true);
                setProfile({ ...profile, alcohol: e.target.value } as Profile);
              }}
            >
              <MenuItem value={'ときどき飲む'}>ときどき飲む</MenuItem>
              <MenuItem value={'飲む'}>飲む</MenuItem>
              <MenuItem value={'飲まない'}>飲まない</MenuItem>
              <MenuItem value={'未選択'}>未選択</MenuItem>
            </Select>
          </Stack>
          <Button
            onClick={() => {
              if (!isCheckLogOut) {
                setIsCheckLogOut(true);
                return;
              }

              localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}MAIL`);
              localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}USER_ID`);
              router('/auth');
            }}
            sx={{
              color: 'black',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              alignItems: 'center',
              pt: 3,
            }}
            endIcon={<ArrowForwardIosIcon />}
          >
            {isCheckLogOut ? '本当にログアウトしますか？（もう一度タップ）' : 'ログアウト'}
          </Button>
        </Stack>
      </HeaderLayout>
      <Modal
        open={Boolean(dialogTarget)}
        onClose={() => setDialogTarget('')}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100dvw - 25px)',
          boxShadow: 24,
          m: 0,
          borderRadius: '15px',
          overflowY: 'auto',
          bgcolor: 'white',
          zIndex: 5,
          height: 'fit-content',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            p: 3,
            py: 5,
            pt: 3.5,
            bgcolor: 'white',
            height: 'fit-content',
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {dialogTarget === 'instagram' ? 'Instagram' : 'Twitter'}ID
            </Typography>
            {dialogInput && (
              <a
                target="_blank"
                rel="noreferrer"
                href={
                  dialogTarget === 'instagram'
                    ? `https://www.instagram.com/${dialogInput}`
                    : `https://twitter.com/${dialogInput}`
                }
                style={{
                  fontFamily: 'Noto Sans JP',
                  color: 'black',
                  textDecoration: 'none',
                  display: 'flex',
                }}
              >
                <Typography variant="caption" sx={{ pr: 0.5 }}>
                  リンクを確認
                </Typography>
                <AirlineStopsIcon fontSize="small" />
              </a>
            )}
          </Stack>
          <TextField
            variant="filled"
            value={dialogInput}
            onChange={(e) => setDialogInput(e.target.value)}
            type="email"
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: '100%',
              justifyContent: 'stretch',
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDialogTarget('');
              }}
              sx={{
                width: '100%',
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setProfile({
                  ...profile,
                  [dialogTarget]: dialogInput,
                } as Profile);

                await supabaseClient
                  .from('profiles')
                  .update({ [dialogTarget]: dialogInput })
                  .eq('id', user.id);

                setDialogTarget('');
                setDialogInput('');
              }}
              sx={{
                fontWeight: 'bold',
                color: 'white',
                width: '100%',
              }}
            >
              保存
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};
