$maps = @(
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Apis_cerana.jpg/400px-Apis_cerana.jpg','public/species/cerana.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Apis_mellifera_Western_honey_bee.jpg/400px-Apis_mellifera_Western_honey_bee.jpg','public/species/mellifera.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Apis_dorsata_on_Tectona_grandis.jpg/400px-Apis_dorsata_on_Tectona_grandis.jpg','public/species/dorsata.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Apis_florea_nest.jpg/400px-Apis_florea_nest.jpg','public/species/florea.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Tetragonula_carbonaria.jpg/400px-Tetragonula_carbonaria.jpg','public/species/trigona.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Brassica_nigra.jpg/400px-Brassica_nigra.jpg','public/flora/mustard.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Eucalyptus_melliodora_flowers.jpg/400px-Eucalyptus_melliodora_flowers.jpg','public/flora/eucalyptus.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Litchi_chinensis_fruits.jpg/400px-Litchi_chinensis_fruits.jpg','public/flora/litchi.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Syzygium_cumini_fruits.jpg/400px-Syzygium_cumini_fruits.jpg','public/flora/jamun.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Moringa_oleifera.jpg/400px-Moringa_oleifera.jpg','public/flora/moringa.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Azadirachta_indica_leaves_and_flowers.jpg/400px-Azadirachta_indica_leaves_and_flowers.jpg','public/flora/neem.jpg'),
  @('https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/400px-Sunflower_sky_backdrop.jpg','public/flora/sunflower.jpg')
)
foreach($m in $maps){
  try{
    Invoke-WebRequest -Uri $m[0] -OutFile $m[1] -UseBasicParsing
    Write-Host "ok $($m[1])"
  } catch {
    Write-Host "fail $($m[0]) $($_.Exception.Message)"
  }
}
Get-ChildItem public/species,public/flora | Select-Object Name,Length | Format-Table -AutoSize
